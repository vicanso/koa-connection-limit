'use strict';

const debug = require('debug')('koa-connection-limit');
/* istanbul ignore next */
function noop() {}


function isFunction(value) {
  return typeof value === 'function';
}

function isObject(value) {
  return typeof value === 'object';
}

function isUndefined(value) {
  return value === undefined;
}

function get(arr, filter, defaultValue) {
  let result;
  arr.forEach((tmp) => {
    if (tmp && filter(tmp)) {
      result = tmp;
    }
  });
  return result || defaultValue;
}

/**
 * [limit description]
 * @param  {[type]} options  [description]
 * @param  {[type]} onChange [description]
 * @return {[type]}          [description]
 */
function limit() {
  const args = Array.from(arguments);
  const onChange = get(args, isFunction, noop);
  const error = new Error('Too Many Requests');
  error.status = 429;
  const options = Object.assign({
    err: error,
    mid: 100,
    high: 500,
  }, get(args, isObject));
  debug('limit options:', options);
  const mid = parseInt(options.mid, 10);
  const high = parseInt(options.high, 10);
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
  if (isUndefined(throwError)) {
    throwError = true;
  }
  const pass = options.pass || noop;
  return (ctx, next) => {
    function checkStatus() {
      if (handlingReqTotal > high) {
        /* istanbul ignore else */
        if (status !== 'high') {
          status = 'high';
          onChange(status);
        }
        /* istanbul ignore else */
        if (throwError) {
          throw options.err;
        }
      } else if (handlingReqTotal > mid) {
        /* istanbul ignore else */
        if (status !== 'mid') {
          status = 'mid';
          onChange(status);
        }
      } /* istanbul ignore else */ else if (status !== 'low') {
        status = 'low';
        onChange(status);
      }
    }

    function done(err) {
      handlingReqTotal -= 1;
      checkStatus();
      if (err) {
        throw err;
      }
    }
    if (pass(ctx)) {
      return next();
    }

    handlingReqTotal += 1;
    checkStatus();
    return next().then(done, done);
  };
}

module.exports = limit;
