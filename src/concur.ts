import { defer, Deferred } from '@xutl/defer';

interface Runable<T> {
	(): Promise<T> | T;
}

interface Runner<T> {
	(runner: Runable<T>): Promise<T>;
}

export class Concur {
	#concurrency: number;
	constructor(concurrency: number) {
		this.#concurrency = concurrency;
	}
	#running: Set<Deferred<void>> = new Set();
	#queued: Deferred<void>[] = [];
	#run = function (this: Concur): void {
		while (this.#queued.length && this.#running.size < this.#concurrency) {
			const next = this.#queued.shift();
			if (next === undefined) continue;
			this.#running.add(next);
			next.resolve();
		}
	};
	async run<T>(execute: Runable<T>): Promise<T> {
		const token = defer<void>();
		this.#queued.push(token);
		this.#run();
		await token;
		this.#running.add(token);
		try {
			return await execute();
		} finally {
			this.#running.delete(token);
			this.#run();
		}
	}
	static create<T>(concurrency: number): Runner<T> {
		const concur = new Concur(concurrency);
		return concur.run.bind(concur);
	}
}
