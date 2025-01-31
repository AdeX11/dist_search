#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');

// Read input from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Load the global index to track document frequency (DF)
const globalIndexFile = '/d/global-index.txt';
let totalDocuments = 0;
const documentFrequency = new Map(); // Number of documents containing each term

if (fs.existsSync(globalIndexFile)) {
  const globalIndex = fs.readFileSync(globalIndexFile, 'utf8').split('\n');
  for (const line of globalIndex) {
    if (line) {
      const [term, , url] = line.split(' | ');
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      totalDocuments = Math.max(totalDocuments, parseInt(url.split('/').pop(), 10) || 0);
    }
  }
}

// Track term frequency in the current document
const termFrequency = new Map();
let totalTerms = 0;

rl.on('line', (line) => {
  const term = line.trim();
  if (term) {
    // Update term frequency for the current document
    termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
    totalTerms++;
  }
});

rl.on('close', () => {
  // Increment the total document count
  totalDocuments++;

  // Calculate TF-IDF for each term
  for (const [term, tf] of termFrequency.entries()) {
    // Update document frequency for the term
    documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);

    // Calculate IDF
    const df = documentFrequency.get(term);
    const idf = Math.log((totalDocuments + 1) / (df + 1)); // Smooth IDF calculation

    // Calculate TF
    const tfScore = tf / totalTerms;

    // Calculate TF-IDF
    const tfidf = tfScore * idf;

    // Output the term and its TF-IDF score
    console.log(`${term} | ${tfidf.toFixed(4)}`);
  }

  // Save the updated document frequency and total document count
  const updatedGlobalIndex = Array.from(documentFrequency.entries())
      .map(([term, df]) => `${term} | ${df} | ${totalDocuments}`)
      .join('\n');
  fs.writeFileSync(globalIndexFile, updatedGlobalIndex);
});
