# connection limit middlware for koa

[![Build Status](https://travis-ci.org/vicanso/koa-connection-limit.svg?style=flat-square)](https://travis-ci.org/vicanso/koa-connection-limit)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-connection-limit/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-connection-limit?branch=master)
[![npm](http://img.shields.io/npm/v/koa-connection-limit.svg?style=flat-square)](https://www.npmjs.org/package/koa-connection-limit)
[![Github Releases](https://img.shields.io/npm/dm/koa-connection-limit.svg?style=flat-square)](https://github.com/vicanso/koa-connection-limit)

## Installation

```bash
$ npm install koa-connection-limit
```

## API

```js
const koa = require('koa');
const koaConnectionLimit = require('koa-connection-limit');
const app = koa();

app.use(koaConnectionLimit({
  mid: 5,
  high: 10,
  throwError: false,
  pass: (ctx) => {
    return false;
  }
}, function (status) {
  // status: low, mid, high
  console.info(status);
}));
```
### Options

- `mid` mid connection limit count
- `high` high connection limit count
- `throwError` when `true` or `undefined`, the connection count reach high limit count, it will throw error
- `pass` if the function return true, the request will be ingore of limit

### onChange

when status change, the function will be triggered


## Example

```js
'use strict';
const Koa = require('koa');
const app = new Koa();
const koaConnectionLimit = require('koa-connection-limit');

// logger

app.use((ctx, next) => {
  const start = new Date;
  return next().then(() => {
    const ms = new Date - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
});


app.use(koaConnectionLimit({
  high: 2,
  mid: 1,
  throwError: false,
  pass: (ctx) => {
    return ctx.url === '/no-limit';
  },
}, function changeStatus(status) {
  console.info(status);
}));


app.use((ctx, next) => {
  const delay = new Promise(function(resolve, reject) {
    setTimeout(resolve, 3000);
  });
  return delay.then(next);
});

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```


## License

MIT
