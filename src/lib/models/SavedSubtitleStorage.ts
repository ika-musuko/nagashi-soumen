import type { Subtitle } from './Subtitle';

export class SavedSubtitleStorage {
	constructor(private subtitleFilename: string) {}

	retrieve(): Subtitle[] {
		const stored: string | null = window.localStorage.getItem(
			this.subtitleFilename
		);
		if (stored === null) return [];

		const subtitleArray: Subtitle[] = JSON.parse(stored);
		return subtitleArray;
	}

	store(subtitles: Subtitle[]) {
		const subtitleArrayString: string = JSON.stringify(subtitles);
		window.localStorage.setItem(this.subtitleFilename, subtitleArrayString);
	}
}
