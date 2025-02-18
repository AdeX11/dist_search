const distribution = require('@brown-ds/distribution');
const { performance } = require('perf_hooks');  // For high-resolution timers

// Function to measure serialization and deserialization latency
function measureLatency(data) {
  const startSerialize = performance.now();
  const serialized = distribution.util.serialize(data);
  const endSerialize = performance.now();

  const startDeserialize = performance.now();
  const deserialized = distribution.util.deserialize(serialized);
  const endDeserialize = performance.now();

  const serializeLatency = endSerialize - startSerialize;
  const deserializeLatency = endDeserialize - startDeserialize;

  return { serializeLatency, deserializeLatency };
}

// Test datasets
const baseTypes = [
  123, "Hello, World!", true, null, undefined
];

const simpleFunction = (a, b) => a + b;

const complexObject = {
  name: "Test Object",
  date: new Date(),
  items: [1, "two", true],
  nested: { innerKey: "innerValue" }
};

// Store total latencies
let totalSerializeTime = 0;
let totalDeserializeTime = 0;
let count = 0;

// Measure latency for base types
baseTypes.forEach((data, index) => {
  const { serializeLatency, deserializeLatency } = measureLatency(data);
  console.log(`Latency for BaseType-${index + 1}:`);
  console.log(`  Serialization Time: ${serializeLatency.toFixed(3)}ms`);
  console.log(`  Deserialization Time: ${deserializeLatency.toFixed(3)}ms`);
  
  totalSerializeTime += serializeLatency;
  totalDeserializeTime += deserializeLatency;
  count++;
});

// Measure latency for function
const functionLatency = measureLatency(simpleFunction);
console.log(`\nLatency for Function Example:`);
console.log(`  Serialization Time: ${functionLatency.serializeLatency.toFixed(3)}ms`);
console.log(`  Deserialization Time: ${functionLatency.deserializeLatency.toFixed(3)}ms`);

totalSerializeTime += functionLatency.serializeLatency;
totalDeserializeTime += functionLatency.deserializeLatency;
count++;

// Measure latency for complex structures
const complexLatency = measureLatency(complexObject);
console.log(`\nLatency for ComplexStructure:`);
console.log(`  Serialization Time: ${complexLatency.serializeLatency.toFixed(3)}ms`);
console.log(`  Deserialization Time: ${complexLatency.deserializeLatency.toFixed(3)}ms`);

totalSerializeTime += complexLatency.serializeLatency;
totalDeserializeTime += complexLatency.deserializeLatency;
count++;

// Calculate and display the overall average latency
const avgSerializeLatency = totalSerializeTime / count;
const avgDeserializeLatency = totalDeserializeTime / count;

console.log(`\nOverall Average Latency:`);
console.log(`  Average Serialization Time: ${avgSerializeLatency.toFixed(3)}ms`);
console.log(`  Average Deserialization Time: ${avgDeserializeLatency.toFixed(3)}ms`);

const testData = { foo: 'bar', baz: undefined, arr: [1, undefined, 3] };
const serialized = distribution.util.serialize(testData);
console.log('Serialized:', serialized);
const deserialized = distribution.util.deserialize(serialized);
console.log('Deserialized:', deserialized);
