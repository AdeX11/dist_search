const readline = require('readline');

// Read input from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const termCounts = new Map();

rl.on('line', (line) => {
  // Step 1: Filter out lines ending with \t+
  if (!line.endsWith('\t+')) {
    const term = line.trim();
    if (term) {
      // Step 2: Count occurrences of each term
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    }
  }
});

rl.on('close', () => {
  // Step 3: Convert the map to an array of [term, count] pairs
  const sortedTerms = Array.from(termCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Step 4: Get the URL from command-line arguments
  const url = process.argv[2];
  if (!url) {
    console.error('Error: URL argument is missing.');
    process.exit(1);
  }

  // Step 5: Output the formatted result
  for (const [term, count] of sortedTerms) {
    console.log(`${term} | ${count} | ${url}`);
  }
});
