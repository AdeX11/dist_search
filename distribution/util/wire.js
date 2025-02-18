const crypto = require('crypto');
const { serialize, deserialize } = require('../util/serialization');
const distribution = require('@brown-ds/distribution');
const local = distribution.local;

// Global map for storing local functions against remote pointers
global.toLocal = {};

let counter = 0; // For generating unique identifiers

/**
 * Converts a synchronous function to an asynchronous one
 * @param {Function} func - The synchronous function to convert
 * @returns {Function} An asynchronous wrapper around func
 */
function toAsync(func) {
  console.log(`Converting function to async: ${func.name}: ${func.toString().replace(/\n/g, '|')}`);

  const asyncFunc = (...args) => {
    const callback = args.pop();
    try {
      const result = func(...args);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  };

  asyncFunc.toString = () => func.toString();
  return asyncFunc;
}

/**
 * Generates a unique identifier for a function
 * @param {Function} func - The function to generate a remote pointer for
 * @returns {string} A unique identifier for the function
 */
function toRemote(func) {
  const funcString = func.toString();
  return `rpc_${counter++}_${crypto.createHash('sha256').update(funcString).digest('hex')}`;
}

/**
 * Creates an RPC stub for a given function
 * @param {Function} func - The function to wrap with RPC functionality
 * @param {Object} nodeInfo - Information about the node where the function resides
 * @returns {Function} An RPC stub function
 */
function createRPC(func, nodeInfo) {
  const remotePointer = toRemote(func);
  global.toLocal[remotePointer] = func;

  return function stub(...args) {
    return new Promise((resolve, reject) => {
      // Assuming the last argument is the callback for error handling
      let cb = args[args.length - 1];
      if (typeof cb !== 'function') {
        throw new Error('Last argument must be a callback function');
      }
      args = args.slice(0, -1);  // Remove the callback from args

      // Serialize arguments
      const serializedArgs = serialize(args);

      // Here we assume 'local' is a module that provides 'send' functionality
      // and that we have a way to determine where to send this RPC (node info)
      let remote = { node: nodeInfo, service: 'rpc', method: remotePointer };

      // Send the RPC call, expecting the node info to be replaced by actual data
      local.send(args, remote, (err, result) => {
        if (err) {
          cb(err);
          reject(err);
        } else {
          const deserializedResult = result;
          cb(null, deserializedResult);
          resolve(deserializedResult);
        }
      });
    });
  };
}

module.exports = {
  createRPC,
  toAsync,
  toRemote,
};