export class Mutex {
  private mutex = Promise.resolve();

  lock(): PromiseLike<() => void> {
    let begin: (unlock: () => void) => void;
    this.mutex = this.mutex.then(() => {
      return new Promise(begin);
    });

    return new Promise((resolve) => { begin = resolve; });
  }
}
