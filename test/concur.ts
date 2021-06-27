import { describe, it } from '@xutl/test';
import * as assert from 'assert';

import { defer, Deferred } from '@xutl/defer';
import { concur } from '../';

describe('concur', () => {
	const execute = concur(3);
	const runners = new Array(10).fill(0, 0, 10).map(() => makeRunner());
	for (const item of runners) execute(item.run);
	it('initial state', () => {
		check(runners, [
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('one done', async () => {
		assert.strictEqual(await complete(runners, 0), 0);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('two done', async () => {
		assert.strictEqual(await complete(runners, 1), 1);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('three done', async () => {
		assert.strictEqual(await complete(runners, 2), 2);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('four done', async () => {
		assert.strictEqual(await complete(runners, 3), 3);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('five done', async () => {
		assert.strictEqual(await complete(runners, 4), 4);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
			{ started: false, done: false },
		]);
	});
	it('six done', async () => {
		assert.strictEqual(await complete(runners, 5), 5);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: false, done: false },
		]);
	});
	it('seven done', async () => {
		assert.strictEqual(await complete(runners, 6), 6);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
			{ started: true, done: false },
		]);
	});
	it('eight done', async () => {
		assert.strictEqual(await complete(runners, 7), 7);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
			{ started: true, done: false },
		]);
	});
	it('nine done', async () => {
		assert.strictEqual(await complete(runners, 8), 8);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: false },
		]);
	});
	it('ten done', async () => {
		assert.strictEqual(await complete(runners, 9), 9);
		check(runners, [
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
			{ started: true, done: true },
		]);
	});
});

function check(runners: { started: boolean; done: boolean }[], expected: { started: boolean; done: boolean }[]) {
	for (let idx = 0; idx < runners.length; idx++) {
		const runner = runners[idx];
		const expect = expected[idx];
		assert.strictEqual(runner?.started, expect?.started, `${idx} started:${runner?.started}`);
		assert.strictEqual(runner?.done, expect?.done, `${idx} done:${runner?.done}`);
	}
}
function makeRunner() {
	const item = Object.assign(defer<number>(), {
		done: false,
		started: false,
		run: async () => {
			item.started = true;
			const result = await item;
			item.done = true;
			return result;
		},
	});
	return item;
}
async function complete(runners: Deferred<number>[], res: number) {
	runners[res].resolve(res);
	const result = await runners[res];
	await new Promise((resolve) => setTimeout(resolve, 1));
	return result;
}
