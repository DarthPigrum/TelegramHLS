'use strict';
module.exports = async camera => {
  const [id, timestamp] = await global.redis.zrange(
    camera,
    -1,
    -1,
    'WITHSCORES'
  );
  return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:1
#EXT-X-MEDIA-SEQUENCE:${timestamp}
#EXTINF:1.000000,
${await global.telegram.getFileLink(id)}`;
};
