import { IterableQueue, QueueInterface, IterableQueueInterface } from './queue';
import { ThrottledQueue, ThrottledInterface, IterableThrottledInterface } from './throttled';

export { IterableQueue, QueueInterface, IterableQueueInterface };
export { ThrottledQueue, ThrottledInterface, IterableThrottledInterface };
export const queue = IterableQueue.create;
export const throttled = ThrottledQueue.create;

const Default = Object.freeze({
	IterableQueue,
	queue,
	ThrottledQueue,
	throttled,
});
export default Default;
