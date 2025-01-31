#!/usr/bin/env node

/*
Extract all text from an HTML page.
Usage: ./getText.js <input > output
*/

const {convert} = require('html-to-text');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
});

let htmlInput = '';

rl.on('line', (line) => {
  htmlInput += line + '\n';
});

rl.on('close', () => {
  const text = convert(htmlInput, {
    formatters: {
      'linkFormatter': function(elem, walk, builder, formatOptions) {
        let aText = '';
        walk(elem.children, builder, (child) => {
          if (child.type === 'text' && child.data) {
            aText += child.data;
          }
        });
        builder.addInline(`${aText} [${elem.attribs.href}]`);
      },
      'headerFormatter': function(elem, walk, builder, formatOptions) {
        // Only uppercase the text within header tags
        let hText = '';
        walk(elem.children, builder, (child) => {
          if (child.type === 'text' && child.data) {
            hText += child.data;
          }
        });
        builder.addInline(hText.toUpperCase());
      },
    },
    selectors: [
      {
        selector: 'a',
        format: 'linkFormatter',
      },
      {
        selector: 'h1+h2+h3+h4+h5+h6',
        format: 'headerFormatter',
      },
    ],
    wordwrap: false,
  });

  console.log(text);
});
