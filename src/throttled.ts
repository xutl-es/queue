import { defer, Deferred } from '@xutl/defer';

export interface ThrottledInterface<T> {
	push(value: T): Promise<void>;
	error(error: Error): void;
	done(): Promise<void>;
}

export interface IterableThrottledInterface<T> extends AsyncIterableIterator<T>, ThrottledInterface<T> {}

export class ThrottledQueue<T> implements IterableThrottledInterface<T> {
	#limit: number;
	#closed: boolean = false;
	#queue: (IteratorResult<T> & Deferred<void>)[] = [];
	#item?: Deferred<IteratorResult<T>>;
	#error?: Error;
	constructor(limit: number) {
		this.#limit = limit;
	}
	#flush = function flush(this: ThrottledQueue<T>) {
		if (this.#error) console.error;
		if (this.#item && this.#error) {
			this.#item.reject(this.#error);
		}
		if (!this.#closed && this.#item && this.#queue.length) {
			const result = this.#queue.pop() as IteratorResult<T> & Deferred<void>;
			this.#closed = this.#closed || result.done || false;
			this.#item.resolve({ done: result.done, value: result.value });
			result.resolve();
			this.#item = undefined;
		}
	};
	async push(value: T): Promise<void> {
		if (this.#closed) throw new Error('queue closed');
		const waiter = this.#queue.length < this.#limit ? Promise.resolve() : this.#queue[this.#limit - 1].promise;
		const data: Partial<IteratorResult<T> & Deferred<void>> = defer<void>();
		data.done = false;
		data.value = value;
		this.#queue.unshift(data as IteratorResult<T> & Deferred<void>);
		this.#flush.call(this);
		await waiter;
	}
	error(error: Error): void {
		this.#error = error;
		this.#flush.call(this);
	}
	async done(): Promise<void> {
		if (this.#closed) throw new Error('queue closed');
		const waiter = this.#queue.length < this.#limit ? Promise.resolve() : this.#queue[this.#limit - 1].promise;
		const data: Partial<IteratorResult<T> & Deferred<void>> = defer<void>();
		data.done = true;
		data.value = null;
		this.#queue.unshift(data as IteratorResult<T> & Deferred<void>);
		this.#flush.call(this);
		await waiter;
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
	static create<T>(limit: number = Number.POSITIVE_INFINITY): IterableThrottledInterface<T> {
		const iq = new ThrottledQueue<T>(limit);
		iq.push = iq.push.bind(iq);
		iq.done = iq.done.bind(iq);
		iq.next = iq.next.bind(iq);
		iq[Symbol.asyncIterator] = iq[Symbol.asyncIterator].bind(iq);
		return iq;
	}
}
