import { writable, type Writable } from "svelte/store";
import { VTTCueMap } from "./VTTCueMap";
import { floatEquals } from "../utils/utils";

type SubtitleTimes = {
  startTime: number;
  endTime: number;
}

export function filterActive(cues: VTTCueMap, activeCueIds: Set<string>): VTTCue[] {
  let activeCues: VTTCue[] = [];
  for (const [id, cue] of cues) {
    if (activeCueIds.has(id)) {
      activeCues.push(cue);
    }
  }
  return activeCues;
}

export class Subtitles {
  cues: VTTCueMap = new VTTCueMap();
  activeCueIds: Set<string> = new Set<string>();

  private originalTimes: Map<string, SubtitleTimes> = new Map();

  // used for parsing subtitles
  private dummyVideo: HTMLMediaElement;
  private dummyTrack: HTMLTrackElement;

  constructor(webVTTURL?: string) {
    this.setupStoreContract();

    if (webVTTURL) {
      this.constructFromURL(webVTTURL)
    }
  }

  // $ svelte store contract
  // https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values
  public subscribe: Writable<Subtitles>['subscribe'];
  private set: Writable<Subtitles>['set'];
  private update: Writable<Subtitles>['update'];

  private setupStoreContract() {
    let { subscribe, set, update } = writable(this);
    this.subscribe = subscribe;
    this.set = set;
    this.update = update;
  }

  private notifyChange() {
    this.update(that => that);
  }

  constructFromURL(webVTTURL: string) {
    this.dummyVideo = document.createElement("video");
    this.dummyTrack = document.createElement("track");

    const track = this.dummyTrack.track;

    this.dummyVideo.append(this.dummyTrack);
    this.dummyTrack.src = webVTTURL;

    track.mode = "hidden";

    this.dummyTrack.addEventListener(
      "load",
      (_: Event) => {
        this.cues.setCues(track.cues);
        for (const [id, cue] of this.cues) {
          const times: SubtitleTimes = { startTime: cue.startTime, endTime: cue.endTime };
          this.originalTimes.set(id, times);
        }
        this.notifyChange();
      }
    );
  }

  updateActive(currentTime: number) {
    // todo: if wiping out the entire 
    // set every time and recreating it
    // is too slow, implement an add/remove
    // system based on the current state
    this.activeCueIds = new Set();

    // todo: if linear search is too
    // much of a performance hit,
    // implement binary search
    for (const [id, cue] of this.cues) {
      if (currentTime >= cue.startTime && currentTime < cue.endTime) {
        this.activeCueIds.add(id);
      }
    }

    this.notifyChange();
  }

  // currentTime is required so we can update 
  // this.activeCueIds after the retime
  retime(offset: number, currentTime: number) {
    for (const [id, cue] of this.cues) {
      const originalTime = this.originalTimes.get(id);
      cue.startTime = originalTime.startTime + offset;
      cue.endTime = originalTime.endTime + offset;
    }

    this.updateActive(currentTime);
  }

  private cueStartTimesSorted(): number[] {
    return this.cues.toArray()
      .map(([_, cue]) => cue.startTime)
      .sort((a, b) => a - b);
  }

  nextSubTime(currentTime: number): number | null {
    const startTimes = this.cueStartTimesSorted();

    let jumpTo: number | null = null;
    for (const startTime of startTimes) {
      if (startTime < currentTime || floatEquals(startTime, currentTime)) {
        continue;
      }
      jumpTo = startTime;
      break;
    }

    return jumpTo;
  }

  prevSubTime(currentTime: number): number | null {
    const startTimes = this.cueStartTimesSorted();

    let nextIndex: number | null = null;
    for (let i = 0; i < startTimes.length; i++) {
      if (startTimes[i] < currentTime) {
        continue;
      }
      nextIndex = i;
      break;
    }

    if (!nextIndex) return null;

    // if there are active cues, nextIndex - 1 
    // would be the index of the currently playing
    // sub. so return the one before that
    let prevIndex = (this.activeCueIds.size > 0)
      ? nextIndex - 2
      : nextIndex - 1;

    return prevIndex > 0
      ? startTimes[prevIndex]
      : null;
  }
}