import { writable, type Writable } from 'svelte/store';
import { SortedSet } from '../utils/SortedSet';
import type { Subtitle } from './Subtitle';

export class SavedSubtitles {
	readonly subtitles = new SortedSet<Subtitle>(
		(sub: Subtitle) => sub.id,
		(sub: Subtitle) => sub.startTime
	);

	private subtitleFilename: string = '';

	public subscribe: Writable<SavedSubtitles>['subscribe'];
	public set: Writable<SavedSubtitles>['set'];
	public update: Writable<SavedSubtitles>['update'];
	constructor() {
		// setup store contract
		let { subscribe, set, update } = writable(this);
		this.subscribe = subscribe;
		this.set = set;
		this.update = update;
	}

	retrieveFromLocalStorage(subtitleFilename: string) {
		this.subtitles.clear();
		this.notifyChange();

		this.subtitleFilename = subtitleFilename;
		const storedString = localStorage.getItem(this.subtitleFilename);
		if (!storedString) return;

		const storedArray = JSON.parse(storedString);
		for (const sub of storedArray) {
			this.subtitles.add(sub);
		}
		this.notifyChange();
	}

	private writeToLocalStorage() {
		const savedSubtitlesString = JSON.stringify(this.subtitles.items);
		window.localStorage.setItem(this.subtitleFilename, savedSubtitlesString);
	}

	private notifyChange() {
		this.update((that) => that);
	}

	save(sub: Subtitle) {
		if (this.subtitles.has(sub)) return;
		this.subtitles.add(sub);
		this.notifyChange();
		this.writeToLocalStorage();
	}

	delete(sub: Subtitle) {
		this.subtitles.delete(sub);
		this.notifyChange();
		this.writeToLocalStorage();
	}

	allAsString(): string {
		return this.subtitles.items.join('\n\n');
	}
}
