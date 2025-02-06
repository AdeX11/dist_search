const distribution = require('../config.js');
const { performance } = require('perf_hooks');  // High-resolution timing

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

// M3 Test Cases

// M4 Test Cases

// M5 Test Cases

// After all tests, measure total execution time
afterAll(() => {
  const endTime = performance.now();
  console.log(`\nTotal execution time: ${(endTime - startTime).toFixed(3)}ms`);
});
