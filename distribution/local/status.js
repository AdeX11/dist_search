const log = require('../util/log');
const path = require('path');
const nodeServer = require('./node');

class StatusService {
  constructor() {
    this.nodeConfig = global.nodeConfig;
    this.state = {
      sid: id.getSID(this.nodeConfig),
      nid: id.getNID(this.nodeConfig),
      counts: 0,
    };
    this.servers = new Map(); // To keep track of running server instances
  }

  // Method to get status information
  get(key, state, configuration, callback) {
    // Handle optional parameters
    if (typeof state === 'function') {
      callback = state;
      configuration = undefined;
      state = undefined;
    } else if (typeof configuration === 'function') {
      callback = configuration;
      configuration = undefined;
    }
    callback = callback || function() {};

    switch (key) {
      case 'nid':
        callback(null, this.state.nid);
        break;
      case 'sid':
        callback(null, this.state.sid);
        break;
      case 'ip':
        callback(null, this.nodeConfig.ip);
        break;
      case 'port':
        callback(null, this.nodeConfig.port);
        break;
      case 'counts':
        callback(null, this.state.counts);
        break;
      case 'heapTotal':
        callback(null, process.memoryUsage().heapTotal);
        break;
      case 'heapUsed':
        callback(null, process.memoryUsage().heapUsed);
        break;
      default:
        callback(new Error('Status key not found'));
    }
  }

  spawn(configuration, callback) {
    callback = callback || function() {};
    
    const { ip, port } = configuration;
  

    nodeServer.start((server) => {
      this.servers.set(`${ip}:${port}`, server);
      log(`Node started at ${ip}:${port}`);
      callback(null, `Node started at ${ip}:${port}`);
    });

    // Error handling for the server
    nodeServer.on('error', (err) => {
      log(`Error starting node at ${ip}:${port}: ${err}`);
      callback(err);
    });
  }

  /**
   * Stop method to stop a running node process
   * @param {Function} callback - Callback function to handle the result
   */
  stop(config, callback) {
    callback = callback || function() {};
    const { node } = config; // Assuming 'node' is the identifier for the node to stop
  
    if (!node) {
      return callback(new Error('Node identifier not provided'));
    }
  
    const server = this.servers.get(node);
    
    if (!server) {
      return callback(new Error(`Server for node ${node} not found`));
    }
  
    server.close(() => {
      this.servers.delete(node);
      callback(null, `Node ${node} stopped`);
    });
  }

  // Method to increment message count
  incrementCount() {
    this.state.counts++;
  }
}

// Export an instance of StatusService
module.exports = new StatusService();