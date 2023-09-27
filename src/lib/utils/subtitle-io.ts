import type { Subtitle } from '../models/Subtitle';

export function fromSRT(content: string): Subtitle[] | null {
	const subtitles: Subtitle[] = [];

	const subtitleTagsPattern = /{\\[a-zA-Z]+\d*(?:\([^}]+\))?}/g;
	const chunks: string[] = content
		.replace(/\r/g, '')
		.replace(subtitleTagsPattern, '') // TODO: handle these in the subs instead of just ignoring them?
		.split('\n\n');

	for (const chunk of chunks) {
		const [id, timecodes, ...textLines] = chunk.split('\n');
		if (!id || !timecodes || !textLines) continue;

		const [startTimecode, endTimecode] = timecodes.split(' --> ');
		if (!startTimecode || !endTimecode) continue;

		const startTime = srtTimeToSeconds(startTimecode);
		const endTime = srtTimeToSeconds(endTimecode);

		if (!startTime || !endTime) {
			return null;
		}

		const text = textLines.join('\n').trim();

		subtitles.push({
			id,
			startTime,
			endTime,
			text,
			active: false,
			saved: false
		});
	}

	return subtitles;
}

function srtTimeToSeconds(timecode: string): number | null {
	const [hours, minutes, secondString] = timecode.split(':');
	const [seconds, milliseconds] = secondString.split(',');

	const hh = parseInt(hours);
	if (!isFinite(hh)) return null;
	const mm = parseInt(minutes);
	if (!isFinite(mm)) return null;
	const ss = parseInt(seconds);
	if (!isFinite(ss)) return null;
	const ms = parseInt(milliseconds);
	if (!isFinite(ms)) return null;

	return hh * 3600 + mm * 60 + ss + ms / 1000;
}

export function downloadSRT(filename: string, subtitles: Subtitle[]) {
	const srtContent = toSRT(subtitles);
	downloadFile(filename, srtContent);
}

function toSRT(subtitles: Subtitle[]): string {
	const srtLines: string[] = [];
	let index = 1;

	for (const sub of subtitles) {
		const startTimeFormatted = formatTime(sub.startTime);
		const endTimeFormatted = formatTime(sub.endTime);

		srtLines.push(`${index}`);
		srtLines.push(`${startTimeFormatted} --> ${endTimeFormatted}`);
		srtLines.push(sub.text);
		srtLines.push('');
		index++;
	}

	const srtContent = srtLines.join('\n');
	return srtContent;
}

function downloadFile(filename: string, content: string) {
	const blob = new Blob([content], { type: 'text/srt' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();

	// Clean up by revoking the object URL
	URL.revokeObjectURL(url);
}

function formatTime(time: number): string {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);
	const milliseconds = Math.floor((time % 1) * 1000);
	return `${hours}:${padZero(minutes)}:${padZero(seconds)}.${padZero(
		milliseconds,
		3
	)}`;
}

function padZero(num: number, width: number = 2): string {
	const numString = num.toString();
	return numString.length >= width
		? numString
		: new Array(width - numString.length + 1).join('0') + numString;
}
