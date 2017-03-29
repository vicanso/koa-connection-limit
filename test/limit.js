'use strict';
const assert = require('assert');
const Koa = require('koa');
const koaConnectionLimit = require('../lib/limit');
const request = require('supertest');

describe('koa-connection-limit', function() {
  it('should throw error when mid or high is invalid', function(done) {
    // mid is not a number
    try {
      koaConnectionLimit({
        mid: 'a',
      });
    } catch (err) {
      assert.equal('mid and high must be a number', err.message);
    }
    // high is not a number
    try {
      koaConnectionLimit({
        high: 'a',
      });
    } catch (err) {
      assert.equal('mid and high must be a number', err.message);
    }
    // mid is lt 1
    try {
      koaConnectionLimit({
        mid: -1,
        high: 10,
      });
    } catch (err) {
      assert.equal('mid and high must gt 0', err.message);
    }
    // high is lt 1
    try {
      koaConnectionLimit({
        mid: 10,
        high: -1,
      });
    } catch (err) {
      assert.equal('mid and high must gt 0', err.message);
    }
    // mid gt high
    try {
      koaConnectionLimit({
        mid: 10,
        high: 2,
      });
    } catch (err) {
      assert.equal('high must be gt mid', err.message);
    }

    done();
  });

  it('should set connection limit successful', function(done) {
    const app = new Koa();
    app.use(koaConnectionLimit({
      mid: 1,
      high: 2,
    }));

    app.use((ctx) => {
      return new Promise(function(resolve) {
        setTimeout(() => {
          ctx.body = 'OK';
          resolve();
        }, 500);
      });
    });
    const total = 3;
    const server = app.listen();
    const statusList = [429, 200, 200];
    let finishCount = 0;
    const finish = (err, res) => {
      assert.equal(res.status, statusList[finishCount]);
      finishCount++;
      if (finishCount === total) {
        done();
      }
    };
    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        request(server)
          .get('/')
          .end(finish);
      }, i * 10);
    }
  });

	it('should pass connection limit successful', function(done) {
    const app = new Koa();
    app.use(koaConnectionLimit({
      mid: 1,
      high: 2,
			pass: () => true,
    }));

    app.use((ctx) => {
      return new Promise(function(resolve) {
        setTimeout(() => {
          ctx.body = 'OK';
          resolve();
        }, 500);
      });
    });
    const total = 3;
    const server = app.listen();
    const statusList = [200, 200, 200];
    let finishCount = 0;
    const finish = (err, res) => {
      assert.equal(res.status, statusList[finishCount]);
      finishCount++;
      if (finishCount === total) {
        done();
      }
    };
    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        request(server)
          .get('/')
          .end(finish);
      }, i * 10);
    }
  });

  it('should onChange event successful', function(done) {
    const app = new Koa();
    app.use(koaConnectionLimit((status) => {
      assert.equal(status, 'low');
    }));

    request(app.listen())
      .get('/')
      .expect(404, done);
  });


  it('should onChange event successful when throw an error', function(done) {
    const app = new Koa();
    app.use(koaConnectionLimit((status) => {
      assert.equal(status, 'low');
    }));
    app.use(ctx => i.j = 0);
    request(app.listen())
      .get('/')
      .expect(500, done);
  });

});
