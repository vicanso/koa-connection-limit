'use strict';
const debug = require('debug')('jt.koa-connection-limit');
/* istanbul ignore next */
const noop = function() {};
const util = require('util');

module.exports = limit;

function limit(options) {
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
	const change = options.change || /* istanbul ignore next */ noop;
	let throwError = options.throwError;
	/* istanbul ignore else */
	if (util.isUndefined(throwError)) {
		throwError = true;
	}
	return (ctx, next) => {
		const res = ctx.res;
		const onfinish = done.bind(null, 'finish');
		const onclose = done.bind(null, 'close');
		res.once('finish', onfinish);
		res.once('close', onclose);

		function done(event) {
			handlingReqTotal--;
			res.removeListener('finish', onfinish);
			res.removeListener('close', onclose);
		}

		handlingReqTotal++;
		if (handlingReqTotal > high) {
			/* istanbul ignore else */
			if (status !== 'high') {
				status = 'high';
				change(status);
			}
			/* istanbul ignore else */
			if (throwError) {
				ctx.throw(429);
			}
		} else if (handlingReqTotal > mid) {
			/* istanbul ignore else */
			if (status !== 'mid') {
				status = 'mid';
				change(status);
			}
		} /* istanbul ignore else */
		else if (status !== 'low') {
			status = 'low';
			change(status);
		}
		return next();
	};
}