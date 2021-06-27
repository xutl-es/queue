import { IterableQueue, QueueInterface, IterableQueueInterface } from './queue';
import { ThrottledQueue, ThrottledInterface, IterableThrottledInterface } from './throttled';
import { Concur } from './concur';

export { IterableQueue, QueueInterface, IterableQueueInterface };
export { ThrottledQueue, ThrottledInterface, IterableThrottledInterface };

export const queue = IterableQueue.create.bind(IterableQueue);
export const throttled = ThrottledQueue.create.bind(ThrottledQueue);
export const concur = Concur.create.bind(Concur);

export function merge<T>(items: AsyncIterable<T>[]): AsyncIterable<T> {
	const result = queue<T>();
	const drain = async (iter: AsyncIterable<T>) => {
		for await (const value of iter) result.push(value);
	};
	Promise.all(items.map(drain)).then(
		() => result.done(),
		(err: Error) => result.error(err),
	);
	return result;
}

const Default = Object.freeze({
	IterableQueue,
	queue,
	ThrottledQueue,
	throttled,
	merge,
	concur,
	Concur,
});
export default Default;
