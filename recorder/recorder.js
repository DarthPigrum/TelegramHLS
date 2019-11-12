'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const Redis = require('ioredis');
const Telegram = require('telegraf/telegram');

const config = JSON.parse(fs.readFileSync('config.json'));

const rotate = arr => {
  let i = -1;
  return () => {
    i++;
    i %= arr.length;
    return arr[i];
  };
};
const chatId = rotate(config.telegramChats);

const redis = new Redis(config.redisEndpoint);
const telegram = new Telegram(config.telegramToken);

http
  .createServer(async (req, res) => {
    const { url } = req;
    res.writeHead(200, {});
    if (req.method === 'PUT') {
      try {
        if (url.endsWith('.ts')) {
          const [camera, key] = path
            .basename(url, '.ts')
            .match(/[a-z]+|[^a-z]+/g);
          const timestamp = parseInt(key);
          if ((await redis.zrangebyscore(camera, timestamp, timestamp)).length)
            await redis.zremrangebyscore(camera, timestamp, timestamp);
          else {
            const id = await telegram
              .sendDocument(chatId(), {
                source: req,
                filename: path.basename(url)
              })
              .then(msg => msg.document.file_id);
            redis.zadd(camera, timestamp, id);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  })
  .listen(config.internalPort);
const {
  inputSettings,
  codecSettings,
  hlsSettings,
  overlaySettings,
  internalPort,
  cameraName
} = config;
const method = `-method PUT http://127.0.0.1:${internalPort}/${cameraName}.m3u8`;
const videoConfig = `${inputSettings} ${codecSettings} ${hlsSettings}`;
exec(`ffmpeg ${videoConfig} ${overlaySettings} ${method}`);
