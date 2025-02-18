// testCommPerformance.test.js
const distribution = require('../config.js');
const { performance } = require('perf_hooks');
const rpcService = distribution.util.wire;
const id = distribution.util.id;

let localServer = null;

// Setup before all tests
beforeAll(done => {
  distribution.node.start((server) => {
    localServer = server;
    console.log('Server started on:', server.address());
    if (server.listening) {
      console.log('Server is now listening');
      done();
    } else {
      console.error('Server did not start listening.');
      done(new Error('Server failed to start'));
    }
  });
}, 10000); // 10 second timeout for starting the server

// Cleanup after all tests
afterAll(() => {
  if (localServer) {
    localServer.close();
  }
});

// Communication Performance Test
test('testCommPerformance', (done) => {
  const node = { ip: '127.0.0.1', port: 1234 };
  const remote = { node: node, service: 'status', method: 'get' };

  const iterations = 10; // Number of requests
  let totalTime = 0;

  let completed = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    distribution.local.comm.send(['nid'], remote, (e, v) => {
      if (e) {
        console.error('Error in communication:', e);
        return done(e); // Fail the test on error
      } else {
        expect(v).toBe(id.getNID(node));
      }
      const end = performance.now();
      totalTime += end - start;
      
      if (++completed === iterations) {
        const avgLatency = totalTime / iterations;
        console.log(`Average Latency for comm: ${avgLatency} ms`);
        console.log(`Throughput for comm: ${iterations / (totalTime / 1000)} requests/second`);
        done();
      }
    });
  }
}, 5000); // Increase timeout to 30 seconds for this test due to potential network delays



test('(5 pts) (scenario) use rpc', (done) => {
  let n = 0;
  const addOne = () => {
    return ++n;
  };
 
  const node = {ip: '127.0.0.1', port: 1235};

  global.nodeConfig = node
  distribution.node.start((server) => {
    function cleanup(callback) {
      server.close();
      distribution.local.comm.send([],
          {node: node, service: 'status', method: 'stop'},
          callback);
    }

    
      // Register the RPC stub on the remote node
      distribution.local.comm.send([{'addOne': distribution.util.wire.createRPC(distribution.util.wire.toAsync(addOne))}, 'addOneService'],
          {node: node, service: 'routes', method: 'put'}, (e, v) => {
        if (e) return cleanup(() => done(e));

        // Call the RPC service three times
        const calls = [
          () => distribution.local.comm.send([],
              {node: node, service: 'addOneService', method: 'addOne'}, callback),
          () => distribution.local.comm.send([],
              {node: node, service: 'addOneService', method: 'addOne'}, callback),
          () => distribution.local.comm.send([],
              {node: node, service: 'addOneService', method: 'addOne'}, callback)
        ];

        let completed = 0;
        function callback(e, v) {
          if (e) return cleanup(() => done(e));
          if (++completed === calls.length) {
            try {
              expect(e).toBeFalsy();
              expect(v).toBe(3);
              expect(n).toBe(3);
              cleanup(done);
            } catch (error) {
              cleanup(() => done(error));
            }
          } else {
            calls[completed]();
          }
        }
        calls[0]();
      });
    
  });
});