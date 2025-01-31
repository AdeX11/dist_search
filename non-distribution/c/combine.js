const readline = require('readline');

// Function to generate n-grams
function generateNGrams(terms, n) {
  const ngrams = [];
  for (let i = 0; i <= terms.length - n; i++) {
    ngrams.push(terms.slice(i, i + n).join(' '));
  }
  return ngrams;
}

// Read input from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const terms = [];

rl.on('line', (line) => {
  const term = line.trim();
  if (term) {
    terms.push(term);
  }
});

rl.on('close', () => {
  // Generate unigrams, bigrams, and trigrams
  const unigrams = generateNGrams(terms, 1);
  const bigrams = generateNGrams(terms, 2);
  const trigrams = generateNGrams(terms, 3);

  // Sort n-grams alphabetically
  const sortedUnigrams = unigrams.sort();
  const sortedBigrams = bigrams.sort();
  const sortedTrigrams = trigrams.sort();

  // Output the results
  console.log(sortedUnigrams.join('\n'));
  console.log(sortedBigrams.join('\n'));
  console.log(sortedTrigrams.join('\n'));
});
