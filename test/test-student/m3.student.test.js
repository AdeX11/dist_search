/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Important: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
const id = distribution.util.id;

// Define some test nodes
const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};
const allNodes = [n1, n2, n3];

test('(1 pts) student test', (done) => {
  /*
    Test the basic functionality of the status service by checking the status of a single node.
  */
  const startTime = Date.now(); // Start timing

  distribution.local.status.get(n1, 'status', (e, v) => {
    const endTime = Date.now(); // End timing
    console.log(`Test 1 took ${endTime - startTime} ms`); // Log elapsed time

    try {
      expect(e).toBeNull(); // No errors
      expect(v).toBeDefined(); // Status should be defined
      expect(v.status).toBe('active'); // Node should be active
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) student test', (done) => {
  /*
    Test creating a group and adding nodes to it.
  */
  const startTime = Date.now(); // Start timing

  const group = {};
  group[id.getSID(n1)] = n1;
  group[id.getSID(n2)] = n2;

  distribution.local.groups.put({gid: 'testGroup'}, group, (e, v) => {
    const endTime = Date.now(); // End timing
    console.log(`Test 2 took ${endTime - startTime} ms`); // Log elapsed time

    try {
      expect(e).toBeNull(); // No errors
      expect(v).toBeDefined(); // Group creation should succeed
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) student test', (done) => {
  /*
    Test dynamically adding a node to an existing group.
  */
  const startTime = Date.now(); // Start timing

  const group = {};
  group[id.getSID(n1)] = n1;

  // Create the group with n1
  distribution.local.groups.put({gid: 'dynamicGroup'}, group, (e, v) => {
    if (e) {
      done(e);
      return;
    }

    // Add n2 dynamically
    distribution.local.groups.add({gid: 'dynamicGroup'}, n2, (e, v) => {
      const endTime = Date.now(); // End timing
      console.log(`Test 3 took ${endTime - startTime} ms`); // Log elapsed time

      try {
        expect(e).toBeNull(); // No errors
        expect(v).toBeDefined(); // Node addition should succeed
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  /*
    Test that nodes have different views of a group.
  */
  const startTime = Date.now(); // Start timing

  const group = {};
  group[id.getSID(n1)] = n1;
  group[id.getSID(n2)] = n2;

  // Create the group
  distribution.local.groups.put({gid: 'relativityGroup'}, group, (e, v) => {
    if (e) {
      done(e);
      return;
    }

    // Fetch the group view from n1 and n2
    distribution.relativityGroup.groups.get('relativityGroup', (e, v) => {
      const endTime = Date.now(); // End timing
      console.log(`Test 4 took ${endTime - startTime} ms`); // Log elapsed time

      try {
        expect(e).toBeNull(); // No errors
        expect(v[id.getSID(n1)]).toBeDefined(); // n1 should see itself
        expect(v[id.getSID(n2)]).toBeDefined(); // n2 should see itself
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  /*
    Test the communication service by sending a message from one node to another.
  */
  const startTime = Date.now(); // Start timing

  const message = 'Hello from n1!';
  const remote = {node: n2, service: 'comm', method: 'send'};

  // Send a message from n1 to n2
  distribution.local.comm.send([message], remote, (e, v) => {
    const endTime = Date.now(); // End timing
    console.log(`Test 5 took ${endTime - startTime} ms`); // Log elapsed time

    try {
      expect(e).toBeNull(); // No errors
      expect(v).toBeDefined(); // Response should be defined
      expect(v).toBe('Message received by n2'); // Validate the response
      done();
    } catch (error) {
      done(error);
    }
  });
});

/*
    This is the setup for the test scenario.
    Do not modify the code below.
*/

let localServer = null;

function startAllNodes(callback) {
  // Ensure callback is a function
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  distribution.node.start((server) => {
    localServer = server;

    function startStep(step) {
      if (step >= allNodes.length) {
        callback(); // All nodes started successfully
        return;
      }

      distribution.local.status.spawn(allNodes[step], (e, v) => {
        if (e) {
          console.error(`Error spawning node ${step}:`, e);
          callback(e); // Pass the error to the callback
          return;
        }
        startStep(step + 1); // Proceed to the next node
      });
    }

    startStep(0); // Start with the first node
  });
}

function stopAllNodes(callback) {
  const remote = {method: 'stop', service: 'status'};

  function stopStep(step) {
    if (step == allNodes.length) {
      callback();
      return;
    }

    if (step < allNodes.length) {
      remote.node = allNodes[step];
      distribution.local.comm.send([], remote, (e, v) => {
        stopStep(step + 1);
      });
    }
  }

  if (localServer) localServer.close();
  stopStep(0);
}

beforeAll((done) => {
  // Stop any leftover nodes
  stopAllNodes(() => {
    startAllNodes(done);
  });
});

afterAll((done) => {
  stopAllNodes(done);
});