'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const Redis = require('ioredis');
const Telegram = require('telegraf/telegram');

const { setMaximalConcurrency } = require('./utils/async');

const api = new Map();
const apiPath = './api/';
const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(message);
};

global.config = JSON.parse(fs.readFileSync('config.json'));

global.redis = new Redis(global.config.redisEndpoint);
global.telegram = new Telegram(global.config.telegramToken);
global.telegram.getFileLink = setMaximalConcurrency(
  global.telegram.getFileLink.bind(global.telegram),
  16
);

fs.readdirSync(apiPath).forEach((name) => {
  const filePath = apiPath + name;
  const key = path.basename(filePath, '.js');
  try {
    const libPath = require.resolve(filePath);
    delete require.cache[libPath];
  } catch (e) {
    return;
  }
  try {
    const method = require(filePath);
    api.set(key, method);
  } catch (e) {
    api.delete(name);
  }
});

http
  .createServer(async(req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const [first, second, ...args] = url.substring(1).split('/');
    if (first === 'api') {
      const method = api.get(second);
      try {
        const result = await method(...args);
        if (typeof result !== 'string' && !(result instanceof Buffer)) {
          httpError(res, 500, 'Server error');
          return;
        }
        res.end(result);
      } catch (e) {
        httpError(res, 500, 'Server error');
      }
    } else {
      const path = `./static${url}`;
      fs.exists(path, (exists) => {
        if (exists) fs.createReadStream(path).pipe(res);
        else httpError(res, 404, 'File is not found');
      });
    }
  })
  .listen(global.config.port);
