// comm.js
const http = require('http');
const { serialize, deserialize } = require('../util/serialization');

class CommService {
  constructor() {
    this.http = http;
  }

  /**
   * Sends a message to a remote node's service
   * @param {Array} message - The arguments to be passed to the remote service method
   * @param {Object} remote - Information about the remote service (node, service, method)
   * @param {Function} [callback] - Optional callback to handle the response
   * @return {void}
   */
  send(message, remote, callback = () => {}) {
    let serializedMessage;
    try {
      serializedMessage = serialize(message); // serialize returns JSON string
      console.log('Serialized message:', serializedMessage);
    } catch (error) {
      return callback(error);
    }

    const options = {
      method: 'PUT',
      hostname: remote.node.ip,
      port: remote.node.port,
      path: `/${remote.node.gid}/${remote.service}/${remote.method}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(serializedMessage)
      }
    };

    const req = this.http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            callback(new Error(`HTTP error ${res.statusCode}: ${data}`));
          } else {
            console.log(' message:', data);
            
            callback(null, data);
          }
        } catch (deserializeError) {
          callback(deserializeError);
        }
      });
    });

    req.on('error', (error) => {
      callback(error);
    });

    req.write(serializedMessage);
    req.end();
  }
}

module.exports = new CommService();