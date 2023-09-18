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
    if (webVTTURL) {
      this.constructFromURL(webVTTURL)
    }
  }
  
  private constructFromURL(webVTTURL: string) {
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
      }
    );
  }
  
  update(currentTime: number) {
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
  }

  // currentTime is required so we can re-update
  // the current active subs
  retime(offset: number, currentTime: number) {
    for (const [id, cue] of this.cues) {
      const originalTime = this.originalTimes.get(id);
      cue.startTime = originalTime.startTime + offset;
      cue.endTime = originalTime.endTime + offset;
    }

    this.update(currentTime);
  }
}