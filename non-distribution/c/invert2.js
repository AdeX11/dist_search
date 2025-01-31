#!/usr/bin/env node
const readline = require('readline');

// Read input from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  // Step 1: Filter out lines ending with \t+
  if (!line.endsWith('\t+')) {
    const [term, tfidf] = line.split(' | ');
    if (term && tfidf) {
      // Step 2: Get the URL from command-line arguments
      const url = process.argv[2];
      if (!url) {
        console.error('Error: URL argument is missing.');
        process.exit(1);
      }

      // Step 3: Output the formatted result
      console.log(`${term} | ${tfidf} | ${url}`);
    }
  }
});
