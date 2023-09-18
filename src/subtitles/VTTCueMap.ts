export class VTTCueMap {
  private cueMap: Map<string, VTTCue> = new Map();
  
  setCues(cues: TextTrackCueList): void {
    this.cueMap = new Map<string, VTTCue>();
    for (const cue of cues) {
      let newCue = new VTTCue(
        cue.startTime,
        cue.endTime,
        // typescript complains that cue 
        // is not a VTTCue, but actually 
        // it is under the hood.
        // @ts-ignore
        cue.text);
      newCue.id = cue.id;
      this.cueMap.set(cue.id, newCue);
    }
  }
    
  get(id: string): VTTCue {
    return this.cueMap.get(id);
  }
  
  [Symbol.iterator](): IterableIterator<[string, VTTCue]> {
    return this.cueMap[Symbol.iterator]();
  }
  
  toArray(): [string, VTTCue][] {
    return Array.from(this.cueMap.entries());
  }
}