import { describe, it } from '@xutl/test';
import * as assert from 'assert';

import { queue } from '../';

describe('can queue and push via timer', () => {
	const q = queue<number>();
	const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let timer: NodeJS.Timer;
	const runner = () => {
		if (!data.length) {
			clearInterval(timer);
			q.done();
		} else {
			q.push(data.shift() as number);
		}
	};

	it('can iterate asynchronously', async () => {
		timer = setInterval(runner, 50);
		const expected = data.slice();
		const actual = [];
		for await (let num of q) actual.push(num);
		assert.deepStrictEqual(actual, expected);
	});
});
