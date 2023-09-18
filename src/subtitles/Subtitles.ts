import { writable, type Writable } from "svelte/store";
import { VTTCueMap } from "./VTTCueMap";

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
  
  private dummyVideo: HTMLMediaElement;
  private dummyTrack: HTMLTrackElement;
  private originalTimes: Map<string, SubtitleTimes> = new Map();

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
    let { subscribe, set, update} = writable(this);
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
          const times: SubtitleTimes = {startTime: cue.startTime, endTime: cue.endTime};
          this.originalTimes.set(id, times);
        }
        this.notifyChange();
      }
    );
  }
  
  updateTime(currentTime: number) {
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

  // currentTime is required so we can re-update
  // the current active subs
  retime(offset: number, currentTime: number) {
    for (const [id, cue] of this.cues) {
      const originalTime = this.originalTimes.get(id);
      cue.startTime = originalTime.startTime + offset;
      cue.endTime = originalTime.endTime + offset;
    }

    this.updateTime(currentTime);
  }
}