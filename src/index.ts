import { defer, Deferred } from '@xutl/defer';

export interface Queue<T> {
	push(value: T): void;
	error(error: Error): void;
	done(): void;
}
export interface IterableQueue<T> extends AsyncIterableIterator<T>, Queue<T> {}

export default class IQ<T> implements IterableQueue<T> {
	#queue: IteratorResult<T>[] = [];
	#item?: Deferred<IteratorResult<T>>;
	#closed: boolean = false;
	#error?: Error;
	#flush = function flush(this: IQ<T>) {
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
	static create<T>(): IterableQueue<T> {
		const iq = new IQ<T>();
		iq.push = iq.push.bind(iq);
		iq.done = iq.done.bind(iq);
		iq.next = iq.next.bind(iq);
		iq[Symbol.asyncIterator] = iq[Symbol.asyncIterator].bind(iq);
		return iq;
	}
}

export const queue = IQ.create;
