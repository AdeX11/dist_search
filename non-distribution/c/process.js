const readline = require('readline');
const fs = require('fs');

// Load stopwords from a file (assuming stopwords are in 'd/stopwords.txt')
const stopwords = new Set(
    fs.readFileSync('d/stopwords.txt', 'utf8')
        .split('\n')
        .map((word) => word.trim())
        .filter((word) => word.length > 0),
);

// Function to process input text
function processInput(input) {
  // Step 1: Convert input to one word per line and remove non-letter characters
  const words = input
      .replace(/[^a-zA-Z\s]/g, ' ') // Remove non-letter characters
      .split(/\s+/) // Split into words
      .filter((word) => word.length > 0); // Remove empty strings

  // Step 2: Convert text to lowercase
  const lowercaseWords = words.map((word) => word.toLowerCase());

  // Step 3: Convert non-ASCII characters to ASCII
  const asciiWords = lowercaseWords.map((word) =>
    word.replace(/[^\x20-\x7E]/g, ''), // Remove non-ASCII characters
  );

  // Step 4: Remove stopwords
  const filteredWords = asciiWords.filter((word) => !stopwords.has(word));

  return filteredWords;
}

// Read input from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let inputText = '';

rl.on('line', (line) => {
  inputText += line + '\n';
});

rl.on('close', () => {
  // Process the input text
  const result = processInput(inputText);

  // Output the result (one word per line)
  console.log(result.join('\n'));
});
