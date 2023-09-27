export function timeDisplay(seconds: number, showMs: boolean = true): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	const milliseconds = Math.round(
		(remainingSeconds - Math.floor(remainingSeconds)) * 1000
	);

	const hh = hours.toString();
	const mm = minutes.toString().padStart(2, '0');
	const ss = Math.floor(remainingSeconds).toString().padStart(2, '0');
	const ms = milliseconds.toString().padStart(3, '0');

	let timeString =
		(hours > 0 ? `${hh}:` : '') + `${mm}:${ss}` + (showMs ? `:${ms}` : '');

	return timeString;
}

export function floatEquals(
	a: number,
	b: number,
	epsilon: number = 0.000001
): boolean {
	return Math.abs(a - b) < epsilon;
}

export function scrollContainerToItem(
	container: HTMLElement,
	item: HTMLElement
) {
	const containerRect = container.getBoundingClientRect();
	const itemRect = item.getBoundingClientRect();

	if (
		itemRect.top < containerRect.top ||
		itemRect.bottom > containerRect.bottom
	) {
		container.scrollTop = item.offsetTop - container.offsetTop;
	}
}

export function count<T>(array: T[], condition: (t: T) => boolean) {
	return array.reduce((acc, t) => (condition(t) ? acc + 1 : acc), 0);
}
