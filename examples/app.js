var koa = require('koa');
var router = require('koa-router')();
var koaConnectionLimit = require('../lib/limit');



var app = koa();

var index = 0;
router.get('/', function* (next) {
  yield new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 3000);
  });
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
