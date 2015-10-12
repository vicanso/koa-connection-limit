# connection limit middlware for koa

## Installation

```bash
$ npm install koa-connection-limit
```

## API

```js
var koa = require('koa');
var koaConnectionLimit = require('koa-connection-limit');
var app = koa();

app.use(koaConnectionLimit({
  mid: 5,
  high: 10,
  throwError: false,
  event: function (status) {
    // status: low, mid, high
    console.info(status);
  }
}));
```
### Options

- `mid` mid connection limit count
- `high` high connection limit count
- `throwError` when `true` or `undefined`, the connection count reach high limit count, it will throw error
- `event` when status change, the event function will be triggered.


## Example

```js
var koa = require('koa');
var router = require('koa-router')();
var koaConnectionLimit = require('koa-connection-limit');



var app = koa();

var index = 0;
router.get('/', function *(next){
  yield function(done){
    setTimeout(done, 3000);
  };
  index++;
  this.body = 'abcd' + index;
});


app.use(koaConnectionLimit({
  mid: 5,
  high: 10,
  throwError: false,
  event: function (status) {
    // status: low, mid, high
    console.info(status);
  }
}));


app.use(router.routes());

var port = process.env.PORT || 10000;
app.listen(port);
console.info('server listen on:' + port);

```


## License

MIT
