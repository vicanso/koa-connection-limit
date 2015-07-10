'use strict';
const debug = require('debug')('jt.koa-connection-limit');
/**
 * [exports 用于控制http的请求数，当超于某个值的时候，直接返回too busy error]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = limit;

function limit(options){
  debug('limit options:', options);
  // 超过mid则输出警告
  // 超过high直接返回error
  let mid = parseInt(options.mid);
  let high = parseInt(options.high);
  if(isNaN(mid) || isNaN(high)){
    throw new Error('mid and high must be number');
  }
  if(mid <= 0 || high <= 0){
    throw new Error('mid and high must gt 0');
  }
  if(mid >= high){
    throw new Error('high must be gt mid');
  }


  let handlingReqTotal = 0;

  return function *(next) {
    /*jshint validthis:true */
    let ctx = this;
    handlingReqTotal++;
    if(handlingReqTotal > high){
      ctx.throw(429);
    }
    if(handlingReqTotal > mid){
      console.warn('request achieve %d', handlingReqTotal);
    }
    let res = ctx.res;
    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');
    res.once('finish', onfinish);
    res.once('close', onclose);
    function done(event){
      handlingReqTotal--;
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
    }
    yield* next;
  };
}
