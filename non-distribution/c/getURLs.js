#!/usr/bin/env node

/*
Extract all URLs from a web page.
Usage: ./getURLs.js <base_url>
*/

const readline = require('readline');
const {JSDOM} = require('jsdom');
const {URL} = require('url');

// Read the base URL from the command-line argument
if (process.argv.length < 3) {
  console.error('Usage: ./getURLs.js <base_url>');
  process.exit(1);
}

let baseURL = process.argv[2];

if (baseURL.endsWith('index.html')) {
  baseURL = baseURL.slice(0, -'index.html'.length);
} else if (!baseURL.endsWith('/')) {
  baseURL += '/';
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let htmlContent = '';

// Read HTML input from stdin
rl.on('line', (line) => {
  htmlContent += line + '\n';
});

rl.on('close', () => {
  // Parse HTML using jsdom
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  // Find all anchor elements (`<a>`) with an `href` attribute
  const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .map((href) => new URL(href, baseURL).href) // Convert to absolute URL
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  // Print each absolute URL
  links.forEach((url) => console.log(url));
});
