import { describe, it } from '@xutl/test';
import * as assert from 'assert';

import { defer } from '@xutl/defer';
import { throttled } from '../';

describe('can throttle and push via timer', () => {
	it('can iterate asynchronously', async () => {
		const q = throttled<number>(1);
		const actual: number[] = [];
		const gate = defer<void>();
		const timer = setInterval(async () => {
			const { done, value } = await q.next();
			if (done) {
				clearInterval(timer);
				gate.resolve();
			} else {
				actual.push(value);
			}
		}, 50);
		const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		for (const item of data) {
			await q.push(item);
		}
		await q.done();
		await gate;
		assert.deepStrictEqual(actual, data);
	});
});
