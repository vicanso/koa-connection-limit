"use strict";
const assert = require('assert');
const EventEmitter = require('events');
const koaConnectionLimit = require('../lib/limit');

describe('koa-connection-limit', function() {
	it('should throw error when mid or high is invalid', function(done) {
		// mid is not a number
		try {
			koaConnectionLimit({
				mid: 'a'
			});
		} catch (err) {
			assert.equal('mid and high must be a number', err.message);
		}
		// high is not a number
		try {
			koaConnectionLimit({
				high: 'a'
			});
		} catch (err) {
			assert.equal('mid and high must be a number', err.message);
		}
		// mid is lt 1
		try {
			koaConnectionLimit({
				mid: -1,
				high: 10
			});
		} catch (err) {
			assert.equal('mid and high must gt 0', err.message);
		}
		// high is lt 1
		try {
			koaConnectionLimit({
				mid: 10,
				high: -1
			});
		} catch (err) {
			assert.equal('mid and high must gt 0', err.message);
		}
		// mid gt high
		try {
			koaConnectionLimit({
				mid: 10,
				high: 2
			});
		} catch (err) {
			assert.equal('high must be gt mid', err.message);
		}

		done();
	});

	it('should set connection limit successful', function(done) {
		let finishCount = 0;
		let statusList = ['low', 'mid', 'high'];
		const hander = koaConnectionLimit({
			mid: 1,
			high: 2
		}, function(status) {
			assert.equal(status, statusList.shift());
		});

		const next = function() {
			return new Promise(function(resolve, reject) {
				setTimeout(resolve, 500);
			});
		};

		const request = function() {
			const res = new EventEmitter();
			hander({
				res: res,
				throw: function(code) {
					assert.equal(code, 429);
				}
			}, next).then(function() {
				res.emit('close');
				finishCount++;
				if (finishCount === 3) {
					done();
				}
			});
		};

		request();
		request();
		request();

	})
});