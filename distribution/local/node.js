const http = require('http');
const url = require('url');
const { serialize, deserialize } = require('../util/serialization');
const log = require('../util/log');
const routes = require('./routes');
const distribution = require('@brown-ds/distribution');
const { createRPC, toAsync, toRemote } = require('../util/wire');

const start = function(callback) {
  const server = http.createServer((req, res) => {
    if (req.method !== 'PUT') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      return res.end('Method Not Allowed');
    }

    const { pathname } = url.parse(req.url, true);
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length < 3) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid URL format' }));
    }
    console.log("parts:", parts);
    const [gid, service, method] = parts;

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    }).on('end', () => {
      try {
        const data = deserialize(body);

        // Check if this is an RPC call by looking in global.toLocal
        if (global.toLocal && global.toLocal[method]) {
          log(`Executing RPC call for method: ${method}`);
          global.toLocal[method](...data, (err, result) => {
            // Check if headers have already been sent
            if (res.headersSent) return;
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(result);
            }
          });
        } else {
          // Standard route handling
          routes.get(service, (err, serviceObject) => {
            // Check if headers have already been sent
            if (res.headersSent) return;
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: err.message }));
            }
            if (serviceObject && serviceObject[method]) {
              serviceObject[method](...data, (err, result) => {
                // Check if headers have already been sent
                if (res.headersSent) return;
                if (err) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: err.message }));
                } else {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(result);
                }
              });
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Service or method not found: ${service}/${method}` }));
            }
          });
        }
      } catch (deserializeError) {
        // Check if headers have already been sent
        if (res.headersSent) return;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: deserializeError.message }));
      }
    });
  });

  server.listen(global.nodeConfig.port, global.nodeConfig.ip, () => {
    log(`Server running at http://${global.nodeConfig.ip}:${global.nodeConfig.port}/`);
    global.distribution.node.server = server;
    callback(server);
  });

  server.on('error', (error) => {
    log(`Server error: ${error}`);
    throw error;
  });
};

module.exports = {
  start: start,
};