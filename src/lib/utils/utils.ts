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
	item: HTMLElement,
	duration: number = 150
) {
	const containerRect = container.getBoundingClientRect();
	const itemRect = item.getBoundingClientRect();
	const containerScrollTop = container.scrollTop;
	const containerHeight = containerRect.height;

	const itemTop = itemRect.top - containerRect.top;
	const itemBottom = itemRect.bottom - containerRect.top;

	const targetScrollTop =
		containerScrollTop + itemTop - (containerHeight - itemRect.height) / 2;

	if (itemTop < 0 || itemBottom > containerHeight) {
		const startTime = performance.now();
		const startScrollTop = container.scrollTop;

		function scrollStep(timestamp: number) {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeOutCubic(progress);
			container.scrollTop =
				startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

			if (progress < 1) {
				requestAnimationFrame(scrollStep);
			}
		}

		requestAnimationFrame(scrollStep);
	}
}

function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

export function count<T>(array: T[], condition: (t: T) => boolean) {
	return array.reduce((acc, t) => (condition(t) ? acc + 1 : acc), 0);
}
