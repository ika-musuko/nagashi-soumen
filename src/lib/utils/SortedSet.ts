export class SortedSet<T> {
	// array implementation to avoid unnecessary creation of new arrays
	// when APIs require an array of the items in the set
	readonly items: T[] = [];
	private keys = new Set<String>();

	constructor(
		private key: (_: T) => string,
		private compare: (_: T) => number
	) {}

	add(item: T) {
		const key = this.key(item);
		if (this.keys.has(key)) return;

		this.keys.add(key);
		this.sortedInsert(item);
	}

	private sortedInsert(item: T) {
		let low = 0,
			high = this.items.length;

		while (low < high) {
			const mid = (low + high) >>> 1;
			if (this.compare(this.items[mid]) < this.compare(item)) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		const insertIndex = low;
		this.items.splice(insertIndex, 0, item);
	}

	has(item: T) {
		return this.keys.has(this.key(item));
	}

	delete(item: T) {
		const key = this.key(item);
		if (!this.keys.delete(key)) return;

		const deleteIndex = this.items.findIndex((t: T) => this.key(t) === key);
		// deleteIndex should not be -1...
		this.items.splice(deleteIndex, 1);
	}

	clear() {
		this.keys.clear();
		this.items.length = 0;
	}
}
