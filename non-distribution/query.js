#!/usr/bin/env node

/*
Search the inverted index for a particular (set of) terms.
Usage: ./query.js your search terms

The behavior of this JavaScript file should be similar to the following shell pipeline:
grep "$(echo "$@" | ./c/process.sh | ./c/stem.js | tr "\r\n" "  ")" d/global-index.txt

Here is one idea on how to develop it:
1. Read the command-line arguments using `process.argv`. A user can provide any string to search for.
2. Normalize, remove stopwords from and stem the query string — use already developed components
3. Search the global index using the processed query string.
4. Print the matching lines from the global index file.

Examples:
./query.js A     # Search for "A" in the global index. This should return all lines that contain "A" as part of an 1-gram, 2-gram, or 3-gram.
./query.js A B   # Search for "A B" in the global index. This should return all lines that contain "A B" as part of a 2-gram, or 3-gram.
./query.js A B C # Search for "A B C" in the global index. This should return all lines that contain "A B C" as part of a 3-gram.

Note: Since you will be removing stopwords from the search query, you will not find any matches for words in the stopwords list.

The simplest way to use existing components is to call them using execSync.
For example, `execSync(`echo "${input}" | ./c/process.sh`, {encoding: 'utf-8'});`
*/

const fs = require('fs');
const {execSync} = require('child_process');

function query(indexFile, args) {
  // 1. Read the command-line arguments
  const queryString = args.join(' '); // Combine arguments into a single query string

  // 2. Normalize, remove stopwords, and stem the query string
  const processedQuery = execSync(`echo "${queryString}" | ./c/process.sh | ./c/stem.js`, {
    encoding: 'utf-8',
  }).trim(); // Process the query string

  if (!processedQuery) {
    console.log('No valid search terms after processing.');
    return;
  }

  // 3. Search the global index using the processed query string
  const globalIndex = fs.readFileSync(indexFile, 'utf8'); // Read the global index file
  const lines = globalIndex.split('\n'); // Split into lines

  // 4. Print the matching lines from the global index file
  const searchTerms = processedQuery.split(' '); // Split processed query into terms
  const matchingLines = lines.filter((line) => {
    const [term] = line.split(' | '); // Extract the term part of the line
    return searchTerms.some((searchTerm) => term.includes(searchTerm)); // Check if any search term matches
  });

  if (matchingLines.length > 0) {
    console.log(matchingLines.join('\n')); // Print matching lines
  } else {
    console.log('No matches found.');
  }
}

const args = process.argv.slice(2); // Get command-line arguments
if (args.length < 1) {
  console.error('Usage: ./query.js [query_strings...]');
  process.exit(1);
}

const indexFile = 'd/global-index.txt'; // Path to the global index file
query(indexFile, args);
