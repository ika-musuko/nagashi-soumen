import { writable, type Writable } from "svelte/store";
import { VTTCueMap } from "./VTTCueMap";
import { Mutex } from "async-mutex";

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

  private mutex = new Mutex();

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

  async updateTime(currentTime: number) {
    const release = await this.mutex.acquire();
    try {
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
    } finally {
      release();
    }
  }

  // currentTime is required so we can re-update
  // the current active subs
  async retime(offset: number, currentTime: number) {
    for (const [id, cue] of this.cues) {
      const originalTime = this.originalTimes.get(id);
      cue.startTime = originalTime.startTime + offset;
      cue.endTime = originalTime.endTime + offset;
    }

    await this.updateTime(currentTime);
  }

  private cueStartTimesSorted(): number[] {
    return this.cues.toArray()
      .map(([_, cue]) => cue.startTime)
      .sort((a, b) => a - b);
  }

  async navigateNext(currentTime: number) {
    const startTimes = this.cueStartTimesSorted();

    let jumpTo: number | null = null;
    for (const startTime of startTimes) {
      if (startTime < currentTime) {
        continue;
      }
      jumpTo = startTime;
      break;
    }

    if (!jumpTo) return;

    await this.updateTime(jumpTo);
  }

  async navigatePrev(currentTime: number) {
    const startTimes = this.cueStartTimesSorted();

    let nextIndex: number | null = null;
    for (let i = 0; i < startTimes.length; i++) {
      if (startTimes[i] < currentTime) {
        continue;
      }
      nextIndex = i;
      break;
    }

    if (!nextIndex || nextIndex < 1) return;

    await this.updateTime(startTimes[nextIndex - 1]);
  }
}