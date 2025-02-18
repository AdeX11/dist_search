const distribution = require('../config.js');
const { performance } = require('perf_hooks');  // High-resolution timing
local = distribution.local;
const nd = require('../distribution/local/node');
const id = distribution.util.id;

// Start time before running tests
const startTime = performance.now();

/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
*/

// M1 Test Cases

test('m1: sample test', () => {
  const object = {milestone: 'm1', status: 'complete'};
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('m1: nested object serialization', () => {
  const object = {
    milestone: 'm2',
    status: 'in progress',
    details: {
      assignedTo: 'Alice',
      priority: 'high'
    }
  };
  
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('m1: array serialization', () => {
  const object = {
    milestone: 'm3',
    tasks: ['task1', 'task2', 'task3'],
  };
  
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('m1: boolean serialization', () => {
  const object = {
    milestone: 'm4',
    isComplete: true,
  };

  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('m1: mixed data types', () => {
  const object = {
    milestone: 'm5',
    status: 'complete',
    progress: 75,
    tags: ['urgent', 'priority'],
    isVerified: false,
  };

  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

// M2 Test Cases
test('m2: status service node info retrieval', (done) => {
  distribution.local.status.get('nid', (err, nid) => {
    expect(err).toBeNull();
    expect(typeof nid).toBe('string');

    distribution.local.status.get('sid', (err, sid) => {
      expect(err).toBeNull();
      expect(typeof sid).toBe('string');
      done();
    });
  });
});



test('m2: should start a node, send a message, and then stop the node', (done) => {
  const node = distribution.node.config;

  const remote = {node: node, service: 'status', method: 'get'};
  const message = ['nid']; // Arguments to the method

  local.comm.send(message, remote, (e, v) => {
    if (e) {
      console.error('Error in communication:', e);
      return done(e);
    }

    try {
      expect(e).toBeFalsy();
      
      // Check if v is undefined before making assertions
      if (v === undefined) {
        console.log('Received undefined value, checking if this is expected.');
      }
      
      // Use toBe for strict equality, including type check
      expect(v).toBe(id.getNID(node));
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('m3: node port and ip configuration check', (done) => {
  const originalIP = distribution.node.config.ip;
  const originalPort = distribution.node.config.port;

  // New configuration for test
  const newConfig = { ip: '127.0.0.1', port: 1234 };

  local.status.get('ip', (err, ip) => {
    expect(err).toBeNull();
    expect(ip).toBe(newConfig.ip);

    local.status.get('port', (err, port) => {
      expect(err).toBeNull();
      expect(port).toBe(newConfig.port);

      done();
     
    });
  });
});
test('m2: node memory usage monitoring', (done) => {
  // Assuming 'status' service has methods to get memory usage
  local.status.get('heapUsed', (err, initialHeapUsed) => {
    expect(err).toBeNull();
    expect(initialHeapUsed).toBeGreaterThan(0); // Ensure we have a valid starting point

    // Simulate some operations that might consume memory - this is just a placeholder
    for (let i = 0; i < 100000; i++) {
      new Array(1000).fill(i); // Simulate memory usage
    }

    // Check memory usage after operations
    local.status.get('heapUsed', (err, heapUsedAfter) => {
      expect(err).toBeNull();
      expect(heapUsedAfter).toBeGreaterThan(initialHeapUsed); // Expect memory to have increased

      // Instead of forcing GC, we wait for the next event loop cycle, which might allow some natural cleanup
      setTimeout(() => {
        // Check memory usage after some time has passed, giving Node.js a chance to perform GC
        local.status.get('heapUsed', (err, heapUsedAfterNaturalCleanup) => {
          expect(err).toBeNull();
          // We can't guarantee that memory will decrease, but it shouldn't increase significantly
          expect(heapUsedAfterNaturalCleanup).toBeLessThanOrEqual(heapUsedAfter * 1.1); // 10% margin for natural increase

          done();
        });
      }, 1000); // Wait for 1 second to give time for some natural GC
    });
  });
});
test('m2: routes service registration and retrieval', (done) => {
  const testService = { ping: () => 'pong' };
  distribution.local.routes.put(testService, 'pingService', (err, name) => {
    expect(err).toBeNull();
    expect(name).toBe('pingService');

    distribution.local.routes.get('pingService', (err, retrievedService) => {
      expect(err).toBeNull();
      expect(typeof retrievedService.ping).toBe('function');
      expect(retrievedService.ping()).toBe('pong');
      done();
    });
  });
});

let localServer = null;

beforeAll((done) => {
  distribution.node.start((server) => {
    localServer = server;
    done();
  });
});

afterAll((done) => {
  localServer.close();
  done();
});
// // M3 Test Cases

// // M4 Test Cases

// // M5 Test Cases

