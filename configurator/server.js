'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(message);
};
const processes = new Map();
const methods = new Map();
methods.set('fetchConfig', async({ name }) =>
  fs.promises.readFile(path.join('..', name, 'config.json'))
);
methods.set('setConfig', async({ name, config }) =>
  fs.promises.writeFile(
    path.join('..', name, 'config.json'),
    JSON.stringify(config)
  )
);
methods.set('startProcess', async({ name }) => {
  if (!processes.has(name)) {
    const filename = (await fs.promises.readdir(path.join('..', name)))
      .filter((filename) => filename.endsWith('.js'))
      .pop();
    processes.set(
      name,
      exec(`cd ../${name};node ${filename}`, console.log)
    );
  }
});

http
  .createServer((req, res) => {
    if (req.method === 'GET') {
      const url = req.url === '/' ? 'index.html' : req.url;
      const filepath = path.join('static', url);
      fs.exists(filepath, (exists) => {
        if (exists) fs.createReadStream(filepath).pipe(res);
        else httpError(res, 404, 'File is not found');
      });
    } else if (req.method === 'POST') {
      try {
        const chunks = [];
        req.on('data', (data) => chunks.push(data));
        req.on('end', async() => {
          const { method, args } = JSON.parse(chunks.join(''));
          res.end(await methods.get(method)(args));
        });
      } catch (e) {
        httpError(500, 'Server error');
      }
    }
  })
  .listen(3000);
