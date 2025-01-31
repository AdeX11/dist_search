#!/bin/bash

# Convert input to a stream of non-stopword terms
# Usage: ./process.sh < input > output

# Convert each line to one word per line, **remove non-letter characters**, make lowercase, convert to ASCII; then remove stopwords (inside d/stopwords.txt)
# Commands that will be useful: tr, iconv, grep

# Step 1: Convert input to one word per line
# Step 2: Remove non-letter characters (keep only letters and spaces)
# Step 3: Convert text to lowercase
# Step 4: Convert non-ASCII characters to ASCII
# Step 5: Remove stopwords

#tr -cs '[:alpha:]' '\n' | # Convert to one word per line, remove non-letters
#tr '[:upper:]' '[:lower:]' | # Convert to lowercase
#iconv -f utf8 -t ascii//TRANSLIT | # Convert to ASCII
#grep -vFx -f d/stopwords.txt # Remove stopwords

node c/process.js

