'use strict';
const debug = require('debug')('jt.koa-connection-limit');
/* istanbul ignore next */
const noop = function() {};
const util = require('util');

module.exports = limit;

/**
 * [limit description]
 * @param  {[type]} options  [description]
 * @param  {[type]} onChange [description]
 * @return {[type]}          [description]
 */
function limit(options, onChange) {
	if (util.isFunction(options)) {
		onChange = options;
		options = null;
	}
	onChange = onChange || noop;
	options = options || /* istanbul ignore next */ {
		mid: 100,
		high: 500
	};
	debug('limit options:', options);
	const mid = parseInt(options.mid);
	const high = parseInt(options.high);
	if (isNaN(mid) || isNaN((high))) {
		throw new Error('mid and high must be a number');
	}
	if (mid <= 0 || high <= 0) {
		throw new Error('mid and high must gt 0');
	}
	if (mid >= high) {
		throw new Error('high must be gt mid');
	}
	let handlingReqTotal = 0;
	let status = '';
	let throwError = options.throwError;
	/* istanbul ignore else */
	if (util.isUndefined(throwError)) {
		throwError = true;
	}
	return (ctx, next) => {

		function done(err) {
			handlingReqTotal--;
			checkStatus();
			if (err) {
				throw err;
			}
		}

		function checkStatus() {

			if (handlingReqTotal > high) {
				/* istanbul ignore else */
				if (status !== 'high') {
					status = 'high';
					onChange(status);
				}
				/* istanbul ignore else */
				if (throwError) {
					ctx.throw(429);
				}
			} else if (handlingReqTotal > mid) {
				/* istanbul ignore else */
				if (status !== 'mid') {
					status = 'mid';
					onChange(status);
				}
			} /* istanbul ignore else */
			else if (status !== 'low') {
				status = 'low';
				onChange(status);
			}
		}

		handlingReqTotal++;
		checkStatus();
		return next().then(done, done);
	};
}