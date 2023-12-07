import { writable, type Writable } from 'svelte/store';
import { floatEquals } from '../utils/utils';
import type { Subtitle } from './Subtitle';
import type { SavedSubtitleStorage } from './SavedSubtitleStorage';

type SubtitleTimes = {
	startTime: number;
	endTime: number;
};

export class Subtitles {
	private originalTimes: Map<string, SubtitleTimes> = new Map();

	// $ svelte store contract
	public subscribe: Writable<Subtitles>['subscribe'];
	public set: Writable<Subtitles>['set'];
	private update: Writable<Subtitles>['update'];

	constructor(public subs: Subtitle[] = []) {
		// setup store contract
		let { subscribe, set, update } = writable(this);
		this.subscribe = subscribe;
		this.set = set;
		this.update = update;

		for (const sub of this.subs) {
			this.originalTimes.set(sub.id, {
				startTime: sub.startTime,
				endTime: sub.endTime
			});
		}

		this.notifyChange();
	}

	private notifyChange() {
		this.update((that) => that);
	}

	saveActive(): Subtitle[] {
		const newlySaved: Subtitle[] = [];
		for (const sub of this.subs) {
			if (sub.active) {
				sub.saved = true;
				newlySaved.push(sub);
			}
		}
		this.notifyChange();
		return newlySaved;
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

	currentSub(currentTime: number): number {
		let i = 0;
		while (i < this.subs.length) {
			if (this.subs[i].startTime > currentTime) {
				break;
			} 
			i++;
		}
		return this.subs[Math.max(0, i - 1)];
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

	prevSubTime(currentTime: number): number {
		let nextSubIndex = this.getNextSubIndex(currentTime);
		let prevSubIndex = Math.max(0, nextSubIndex - 1);
		return this.subs[prevSubIndex].startTime;
	}

	private getNextSubIndex(currentTime: number): number {
		let i;
		for (
			i = 0;
			i < this.subs.length && currentTime > this.subs[i].endTime;
			i++
		);
		return i;
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
