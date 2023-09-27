import { writable, type Writable } from 'svelte/store';
import { floatEquals } from '../utils/utils';
import { saveSubtitleFile } from '../utils/subtitle-save-file';
import type { Subtitle } from './Subtitle';
import type { SavedSubtitleStorage } from './SavedSubtitleStorage';

type SubtitleTimes = {
	startTime: number;
	endTime: number;
};

export class Subtitles {
	subs: Subtitle[] = [];

	private originalTimes: Map<string, SubtitleTimes> = new Map();

	// TODO: don't parse subtitles via this dummy element hack
	//
	// these dummy elements cannot be initialized here
	// because this could get created before document even exists
	private dummyVideo: HTMLMediaElement | undefined;
	private dummyTrack: HTMLTrackElement | undefined;

	// $ svelte store contract
	public subscribe: Writable<Subtitles>['subscribe'];
	public set: Writable<Subtitles>['set'];
	private update: Writable<Subtitles>['update'];

	constructor() {
		// setup store contract
		let { subscribe, set, update } = writable(this);
		this.subscribe = subscribe;
		this.set = set;
		this.update = update;
	}

	private notifyChange() {
		this.update((that) => that);
	}

	async constructFromURL(
		webVTTURL: string,
		savedSubtitleStorage: SavedSubtitleStorage
	) {
		if (this.dummyVideo === undefined)
			this.dummyVideo = document.createElement('video');
		if (this.dummyTrack === undefined)
			this.dummyTrack = document.createElement('track');

		const track = this.dummyTrack.track;
		this.dummyVideo.append(this.dummyTrack);
		this.dummyTrack.src = webVTTURL;

		track.mode = 'hidden';

		this.dummyTrack.addEventListener('load', (_: Event) => {
			if (track.cues) this.constructSubs(track.cues);
			const retrievedSavedSubs: Subtitle[] = savedSubtitleStorage.retrieve();
			this.saveBatch(retrievedSavedSubs);
			this.notifyChange();
		});
	}

	private constructSubs(cues: TextTrackCueList) {
		this.subs = Array.from(cues)
			.map((cue) => {
				return {
					id: cue.id,
					startTime: cue.startTime,
					endTime: cue.endTime,
					// @ts-ignore: cue is actually a VTTCue object so it has .text
					text: cue.text
				} as Subtitle;
			})
			.sort((s1: Subtitle, s2: Subtitle) => s1.startTime - s2.startTime);
		for (const sub of this.subs) {
			const times: SubtitleTimes = {
				startTime: sub.startTime,
				endTime: sub.endTime
			};
			this.originalTimes.set(sub.id, times);
		}
	}

	saveToFile() {
		saveSubtitleFile(this.subs);
	}

	saveActive() {
		for (const sub of this.subs) {
			if (sub.active) {
				sub.saved = true;
			}
		}
		this.notifyChange();
	}

	updateActive(currentTime: number) {
		for (const sub of this.subs) {
			sub.active = currentTime >= sub.startTime && currentTime < sub.endTime;
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
			if (
				sub.startTime < currentTime ||
				floatEquals(sub.startTime, currentTime)
			) {
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
		let prevIndex = nextIndex - 1;

		return prevIndex > 0 ? this.subs[nextIndex - 1].startTime : null;
	}

	save(sub: Subtitle) {
		this.modify(sub.id, (s) => {
			s.saved = true;
		});
	}

	saveBatch(subsToSave: Subtitle[]) {
		if (subsToSave.length === 0) return;

		for (const subToSave of subsToSave) {
			for (const sub of this.subs) {
				if (sub.id === subToSave.id) {
					sub.saved = true;
					break;
				}
			}
		}
		this.notifyChange();
	}

	unsave(sub: Subtitle) {
		this.modify(sub.id, (s) => {
			s.saved = false;
		});
	}

	private modify(id: string, mod: (sub: Subtitle) => void) {
		for (const sub of this.subs) {
			if (sub.id === id) {
				mod(sub);
				break;
			}
		}
		this.notifyChange();
	}
}
