#!/bin/bash

# index.sh runs the core indexing pipeline.

cat "$1" |
  c/process.sh |
  c/stem.js |
  c/combine.sh |
  c/invert.sh "$2" |
  c/merge.js d/global-index.txt |
  sort -o d/global-index.txt


# cat "$1" |
#   c/process.sh |  # Tokenize and preprocess the document
#   c/stem.js |     # Stem terms
#   c/combine.sh |  # Generate n-grams
#   c/tfidf.js |    # Calculate TF-IDF scores (streaming-friendly)
#   c/invert2.js "$2" |  # Invert the index with TF-IDF scores
#   c/merge.js d/global-index.txt |  # Merge with the global index
#   sort -o d/global-index.txt  # Sort the global index