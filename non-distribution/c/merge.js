#!/usr/bin/env node

/*
Merge the current inverted index (assuming the right structure) with the global index file
Usage: cat input | ./merge.js global-index > output

The inverted indices have the different structures!

Each line of a local index is formatted as:
  - `<word/ngram> | <frequency> | <url>`

Each line of a global index is be formatted as:
  - `<word/ngram> | <url_1> <frequency_1> <url_2> <frequency_2> ... <url_n> <frequency_n>`
  - Where pairs of `url` and `frequency` are in descending order of frequency
  - Everything after `|` is space-separated

-------------------------------------------------------------------------------------
Example:

local index:
  word1 word2 | 8 | url1
  word3 | 1 | url9
EXISTING global index:
  word1 word2 | url4 2
  word3 | url3 2

merge into the NEW global index:
  word1 word2 | url1 8 url4 2
  word3 | url3 2 url9 1

Remember to error gracefully, particularly when reading the global index file.
*/

const fs = require('fs');
const readline = require('readline');
// The `compare` function can be used for sorting.
const compare = (a, b) => {
  if (a.freq > b.freq) {
    return -1;
  } else if (a.freq < b.freq) {
    return 1;
  } else {
    return 0;
  }
};
const rl = readline.createInterface({
  input: process.stdin,
});

// 1. Read the incoming local index data from standard input (stdin) line by line.
let localIndex = ''; // Initialize localIndex as an empty string
rl.on('line', (line) => {
  localIndex += line + '\n'; // Append each line to localIndex
});

rl.on('close', () => {
  // 2. Read the global index name/location, using process.argv
  const globalIndexFile = process.argv[2];
  if (!globalIndexFile) {
    console.error('Error: Global index file not provided.');
    process.exit(1);
  }

  // Read the global index file and call printMerged as a callback
  fs.readFile(globalIndexFile, 'utf8', (err, data) => {
    printMerged(err, data);
  });
});

const printMerged = (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Split the data into an array of lines
  const localIndexLines = localIndex.trim().split('\n'); // Remove trailing newline and split
  const globalIndexLines = data.trim().split('\n'); // Remove trailing newline and split

  const local = {};
  const global = {};

  // 3. For each line in `localIndexLines`, parse them and add them to the `local` object where keys are terms and values contain `url` and `freq`.
  for (const line of localIndexLines) {
    const [term, freq, url] = line.split(' | ');
    if (!local[term]) {
      local[term] = [];
    }

    // Check if the URL already exists for this term
    const existingEntry = local[term].find((entry) => entry.url === url);
    if (!existingEntry) {
      local[term].push({url, freq: parseInt(freq, 10)});
    }
  }

  // 4. For each line in `globalIndexLines`, parse them and add them to the `global` object where keys are terms and values are arrays of `url` and `freq` objects.
  // Use the .trim() method to remove leading and trailing whitespace from a string.
  for (const line of globalIndexLines) {
    const [term, rest = ''] = line.split(' | ');
    if (rest =='') {
      continue;
    }


    // Split the rest into an array of URL-frequency pairs if rest exists
    const urlFreqPairs = rest.trim() ? rest.split(' ') : [];

    global[term] = [];
    for (let i = 0; i < urlFreqPairs.length; i += 2) {
      global[term].push({
        url: urlFreqPairs[i],
        freq: parseInt(urlFreqPairs[i + 1], 10),
      });
    }
  }

  // 5. Merge the local index into the global index:
  // - For each term in the local index, if the term exists in the global index:
  //     - Append the local index entry to the array of entries in the global index.
  //     - Sort the array by `freq` in descending order.
  // - If the term does not exist in the global index:
  //     - Add it as a new entry with the local index's data.
  for (const term of Object.keys(local)) {
    if (global[term]) {
      // If the term exists in the global index, merge and update counts
      const urlMap = new Map();

      // Add global entries to the map
      for (const entry of global[term]) {
        urlMap.set(entry.url, (urlMap.get(entry.url) || 0) + entry.freq);
      }

      // Add local entries to the map
      for (const entry of local[term]) {
        urlMap.set(entry.url, (urlMap.get(entry.url) || 0) + entry.freq);
      }

      // Convert the map back to an array of objects
      global[term] = Array.from(urlMap.entries()).map(([url, freq]) => ({
        url,
        freq,
      }));
    } else {
      // If the term does not exist, add it as a new entry
      global[term] = local[term];
    }

    // Sort the entries by frequency in descending order
    global[term].sort(compare);
  }


  // 6. Print the merged index to the console in the same format as the global index file:
  //    - Each line contains a term, followed by a pipe (`|`), followed by space-separated pairs of `url` and `freq`.
  for (const term in global) {
    const urlFreqPairs = global[term]
        .map((entry) => `${entry.url} ${entry.freq}`)
        .join(' ');
    console.log(`${term} | ${urlFreqPairs}`);
  }
};
