# @xutl/queue

One [eXtremely Useful Tool Library](https://xutl.es) to provide async iterable queues. A async iterable queue is something that you can push something onto (such as data that comes in on events) and that you can also async iterate over using `for await (let item of queue)`.

## Install

```bash
npm install --save-dev @xutl/queue
```

## Usage

```typescript
import { queue } from '@xutl/queue';

const myqueue = queue<Buffer>();
process.stdin.on('data', (buffer) => myqueue.push(buffer));
process.stdin.on('close', () => myqueue.done());
process.stdin.on('error', (err: Error) => myqueue.error(err));

for await (let item of myqueue) {
	console.error(`Received Buffer of length ${item.length} on STDIN`);
}
```

## License

Copyright 2019,2020 xutl.es

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
