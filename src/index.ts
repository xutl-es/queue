import { defer, Deferred } from '@xutl/defer';

export interface Queue<T> {
	push(value: T): void;
	error(error: Error): void;
	done(): void;
}
export interface IterableQueueInterface<T> extends AsyncIterableIterator<T>, Queue<T> {}

export class IterableQueue<T> implements IterableQueueInterface<T> {
	#queue: IteratorResult<T>[] = [];
	#item?: Deferred<IteratorResult<T>>;
	#closed: boolean = false;
	#error?: Error;
	#flush = function flush(this: IterableQueue<T>) {
		if (this.#error) console.error;
		if (this.#item && this.#error) {
			this.#item.reject(this.#error);
		}
		if (!this.#closed && this.#item && this.#queue.length) {
			const result = this.#queue.shift() as IteratorResult<T>;
			this.#closed = this.#closed || result.done || false;
			this.#item.resolve(result);
			this.#item = undefined;
		}
	};
	push(value: T) {
		if (!this.#closed) this.#queue.push({ value, done: false });
		this.#flush.call(this);
	}
	done() {
		if (!this.#closed) this.#queue.push({ value: undefined, done: true });
		this.#flush.call(this);
	}
	error(error: Error) {
		this.#error = error;
		this.#flush.call(this);
	}
	async next() {
		await this.#item;
		const result = (this.#item = defer<IteratorResult<T>>());
		this.#flush.call(this);
		return await result;
	}
	[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		return this;
	}
	static create<T>(): IterableQueueInterface<T> {
		const iq = new IterableQueue<T>();
		iq.push = iq.push.bind(iq);
		iq.done = iq.done.bind(iq);
		iq.next = iq.next.bind(iq);
		iq[Symbol.asyncIterator] = iq[Symbol.asyncIterator].bind(iq);
		return iq;
	}
}
export const queue = IterableQueue.create;

const Default = Object.freeze({
	IterableQueue,
	queue,
});
export default Default;
