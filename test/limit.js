"use strict";
const assert = require('assert');
const koa = require('koa');
const koaConnectionLimit = require('../lib/limit');
const router = require('koa-router')();
const request = require('superagent');
const http = require('http');

describe('koa-connection-limit', function () {
  it('should set connection limit successful', function (done) {
    let statusList = [];
    let app = koa();
    router.get('/', function* (next) {
      yield new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve();
        }, 300);
      });
      this.body = 'OK';
    });
    app.use(koaConnectionLimit({
      mid: 5,
      high: 10,
      event: function (status) {
        if (statusList.indexOf(status) === -1) {
          statusList.push(status);
        }
      }
    }));
    app.use(router.routes());
    let port = process.env.PORT || 10000;
    let httpServer = http.createServer(app.callback()).listen(port);
    console.info('server listen on:' + port);

    let total = 20;
    let finished = 0;
    let count = total;
    while (count--) {
      setTimeout(function () {
        request.get('http://localhost:10000/').end(function (err,
          res) {
          finished++;
          if (finished === total) {
            request.get('http://localhost:10000/').end(function () {
              assert.equal(statusList.sort().join(','),
                'high,low,mid');
              done();
              httpServer.close();
            });
          }
        });
      }, total * 10);
    }
  });
});
