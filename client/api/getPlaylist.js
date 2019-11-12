'use strict';
const start = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:1`;
const end = '#EXT-X-ENDLIST';
const chunk = url => `#EXTINF:1.000000,\n${url}`;
module.exports = async (camera, startTimestamp, endTimestamp) => {
  const chunks = await Promise.all(
    (
      await global.redis.zrangebyscore(
        camera,
        parseInt(startTimestamp),
        parseInt(endTimestamp)
      )
    ).map(id => global.telegram.getFileLink(id).then(chunk))
  );
  chunks.unshift(start);
  chunks.push(end);
  return chunks.join('\n');
};
