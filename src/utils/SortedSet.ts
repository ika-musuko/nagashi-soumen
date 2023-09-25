export class SortedSet<T> {
  private key: (t: T) => string;
  private compare: (t: T) => number;

  // array implementation to avoid unnecessary creation of new arrays
  // when APIs require an array of the items in the set
  private items: T[] = [];
  private keys = new Set<String>();

  constructor(key: (_: T) => string, compare: (_: T) => number) {
    this.key = key;
    this.compare = compare;
  }

  add(item: T) {
    const key = this.key(item);
    if (this.keys.has(key)) return;

    this.keys.add(key);
    this.sortedInsert(item);
  }

  private sortedInsert(item: T) {
    let low = 0, high = this.items.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (this.compare(this.items[mid]) < this.compare(item)) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    let insertIndex = low;
    this.items.splice(insertIndex, 0, item);
  }

  delete(item: T) {
    const key = this.key(item);
    if (!this.keys.delete(key)) return;

    const deleteIndex = this.items.findIndex((t: T) => this.key(t) === key);
    // deleteIndex should not be -1...
    this.items.splice(deleteIndex, 1);
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return this.items;
  }
}