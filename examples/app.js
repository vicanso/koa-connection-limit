var koa = require('koa');
var router = require('koa-router')();
var koaConnectionLimit = require('../lib/limit');



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
  mid : 10,
  high : 20
}));


app.use(router.routes());

var port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);