#!/bin/bash

# Invert index to create a mapping from a term to all URLs containing the term.

# Usage: ./invert.sh url < n-grams
# grep -v $'\t+$' | sort | uniq -c | awk '{print $2,$3,$4,"|",$1,"|"}' | sed 's/\s\+/ /g' | sort | sed "s|$| $1|"
# Check if URL argument is provided
if [ -z "$1" ]; then
  echo "Error: URL argument is missing."
  echo "Usage: ./invert.sh url < n-grams"
  exit 1
fi

# Pass the URL to the JavaScript script
node c/invert.js "$1"
