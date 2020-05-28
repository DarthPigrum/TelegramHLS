'use strict';
module.exports = async(camera, start, end) =>
  (start && end ?
    global.redis.zrangebyscore(
      camera,
      parseInt(start),
      parseInt(end),
      'WITHSCORES'
    ) :
    global.redis.zrange(camera, 0, 2e9, 'WITHSCORES')
  )
    .then((arr) =>
      arr
        .filter((value, index) => index % 2)
        .map((timestamp) => parseInt(timestamp))
    )
    .then((arr) =>
      arr
        .map((v, k) =>
          (v - 1 === arr[k - 1] ?
            arr[k + 1] === v + 1 ?
              '' :
              `-${v},` :
            v + ',')
        )
        .join('')
        .split(',-')
        .join('-')
    )
    .then((str) => str.substring(0, str.length - 1))
    .then((arr) =>
      arr
        .split(',')
        .map((range) =>
          range.split('-').map((timestamp) => parseInt(timestamp))
        )
    )
    .then(JSON.stringify);
