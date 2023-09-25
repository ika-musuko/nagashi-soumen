import { writable, type Writable } from "svelte/store";
import { floatEquals } from "../utils/utils";
import { saveSubtitleFile } from "./subtitle-save-file";
import type { Subtitle } from "./Subtitle";

type SubtitleTimes = {
  startTime: number;
  endTime: number;
}

export function filterActive(subs: Subtitle[], activeSubIds: Set<string>): Subtitle[] {
  let activeSubs: Subtitle[] = [];
  for (const sub of subs) {
    if (activeSubIds.has(sub.id)) {
      activeSubs.push(sub);
    }
  }
  return activeSubs;
}

export class Subtitles {
  subs: Subtitle[] = [];
  activeSubIds: Set<string> = new Set<string>();

  private originalTimes: Map<string, SubtitleTimes> = new Map();

  // used for parsing subtitles
  private dummyVideo: HTMLMediaElement = document.createElement("video");
  private dummyTrack: HTMLTrackElement = document.createElement("track");

  // $ svelte store contract
  // https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values
  public subscribe: Writable<Subtitles>['subscribe'];
  private set: Writable<Subtitles>['set'];
  private update: Writable<Subtitles>['update'];

  constructor(webVTTURL?: string) {
    // setup store contract
    let { subscribe, set, update } = writable(this);
    this.subscribe = subscribe;
    this.set = set;
    this.update = update;

    if (webVTTURL) {
      this.constructFromURL(webVTTURL);
    }
  }

  private notifyChange() {
    this.update(that => that);
  }

  constructFromURL(webVTTURL: string) {
    const track = this.dummyTrack.track;

    this.dummyVideo.append(this.dummyTrack);
    this.dummyTrack.src = webVTTURL;

    track.mode = "hidden";

    this.dummyTrack.addEventListener(
      "load",
      (_: Event) => {
        // @ts-ignore: Array.from() on a TextTrackCueList works fine
        this.subs = Array.from(track.cues)
          .map(cue => {
            return {
              id: cue.id,
              startTime: cue.startTime,
              endTime: cue.endTime,
              // @ts-ignore: cue is actually a VTTCue object so it has .text
              text: cue.text
            } as Subtitle;
          }).sort((s1: Subtitle, s2: Subtitle) => s1.startTime - s2.startTime);
        for (const sub of this.subs) {
          const times: SubtitleTimes = { startTime: sub.startTime, endTime: sub.endTime };
          this.originalTimes.set(sub.id, times);
        }
        this.notifyChange();
      }
    );
  }

  saveToFile() {
    saveSubtitleFile(this.subs);
  }

  updateActive(currentTime: number) {
    this.activeSubIds = new Set();

    for (const sub of this.subs) {
      if (currentTime >= sub.startTime && currentTime < sub.endTime) {
        this.activeSubIds.add(sub.id);
      }
    }

    this.notifyChange();
  }

  // currentTime is required so we can update 
  // this.activeSubIds after the retime
  retime(offset: number, currentTime: number) {
    for (const sub of this.subs) {
      const originalTime = this.originalTimes.get(sub.id);
      if (originalTime === undefined) continue;
      sub.startTime = originalTime.startTime + offset;
      sub.endTime = originalTime.endTime + offset;
    }

    this.updateActive(currentTime);
  }

  nextSubTime(currentTime: number): number | null {
    let jumpTo: number | null = null;
    for (const sub of this.subs) {
      if (sub.startTime < currentTime || floatEquals(sub.startTime, currentTime)) {
        continue;
      }
      jumpTo = sub.startTime;
      break;
    }

    return jumpTo;
  }

  prevSubTime(currentTime: number): number | null {
    let nextIndex: number | null = null;
    for (let i = 0; i < this.subs.length; i++) {
      if (this.subs[i].startTime < currentTime) {
        continue;
      }
      nextIndex = i;
      break;
    }

    if (!nextIndex) return null;

    // if there are active subs, nextIndex - 1 
    // would be the index of the currently playing
    // sub. so return the one before that
    let prevIndex = (this.activeSubIds.size > 0)
      ? nextIndex - 2
      : nextIndex - 1;

    return prevIndex > 0
      ? this.subs[prevIndex].startTime
      : null;
  }
}