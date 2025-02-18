const distribution = require('../../config.js');

test('(2 pts) (scenario) simple callback practice', () => {
  const results = [];

  function add(a, b, callback) {
    const result = a + b;
    callback(result);
  }

  function storeResults(result) {
    results.push(result);
  }

  add(1, 2, storeResults);
  add(2, 3, storeResults);
  add(3, 4, storeResults);

  expect(results).toEqual([3, 5, 7]);
});
test('(2 pts) (scenario) collect errors and successful results', (done) => {
  // Mock services for testing
  const services = [
    (callback) => callback(null, 'good apples'),
    (callback) => callback(new Error('bad pineapples')),
    (callback) => callback(null, 'good bananas'),
    (callback) => callback(null, 'good peaches'),
    (callback) => callback(new Error('bad mangoes')),
  ];

  const vs = [];
  const es = [];
  let expecting = services.length;
  for (const service of services) {
    service((e, v) => {
      if (e) {
        es.push(e);
      } else {
        vs.push(v);
      }
      expecting -= 1;
      if (expecting === 0) {
        try {
          expect(vs.length).toBe(3);
          expect(vs).toContain('good apples');
          expect(vs).toContain('good bananas');
          expect(vs).toContain('good peaches');
          for (const e of es) {
            expect(e instanceof Error).toBe(true);
          }
          const messages = es.map((e) => e.message);
          expect(messages.length).toBe(2);
          expect(messages).toContain('bad pineapples');
          expect(messages).toContain('bad mangoes');
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  }
});
test('(5 pts) (scenario) use rpc', (done) => {
  let n = 0;
  const addOne = () => {
    return ++n;
  };

  const node = {ip: '127.0.0.1', port: 9009};

  let addOneRPC = '?';

  const rpcService = {
    addOne: addOneRPC,
  };

  distribution.local.node.start((server) => {
    function cleanup(callback) {
      server.close();
      distribution.local.comm.send([],
          {node: node, service: 'status', method: 'stop'},
          callback);
    }

    // Assume that spawn starts a new node for testing
    distribution.local.status.spawn(node, (e, v) => {
      if (e) return done(e);

      // Register the RPC stub on the remote node
      distribution.local.comm.send([rpcService, 'addOneService'],
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
});