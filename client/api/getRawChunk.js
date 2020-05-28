'use strict';
const fetch = require('node-fetch');
module.exports = async(filename) =>
  fetch(
    `https://api.telegram.org/file/bot${global.config.telegramToken}/documents/${filename}`
  ).then((res) => res.buffer());
