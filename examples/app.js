'use strict';
const Koa = require('koa');
const app = new Koa();
const koaConnectionLimit = require('../lib/limit');

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
  throwError: false
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
