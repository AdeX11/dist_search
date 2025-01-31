#!/bin/bash

# Test script for the indexer component

# Initialize counters and timers
index_start_time=$(date +%s.%N)
documents_indexed=0

while read -r url; do
  if [[ "$url" == "stop" ]]; then
    echo "[indexer] stopping indexer: 'stop' signal received" >&2
    break
  fi

  echo "[indexer] indexing $url" >&2
  ./index.sh d/content.txt "$url"
  documents_indexed=$((documents_indexed + 1))

  # Add the URL to indexed.txt (if needed)
  echo "$url" >> d/indexed.txt

  # Debug: Print the number of lines in indexed.txt and urls.txt
  indexed_count=$(wc -l < d/indexed.txt)
  urls_count=$(wc -l < d/urls.txt)
  echo "[debug] indexed.txt lines: $indexed_count, urls.txt lines: $urls_count" >&2

  if [[ "$indexed_count" -ge "$urls_count" ]]; then
    echo "[indexer] stopping indexer: all URLs indexed" >&2
    break
  fi

done < <(tail -f d/urls.txt)

# Calculate throughput
index_end_time=$(date +%s.%N)
# Convert to milliseconds directly using awk
index_total_time_ms=$(awk "BEGIN {printf \"%.3f\", ($index_end_time - $index_start_time) * 1000}")

if [ $(echo "$index_total_time_ms == 0" | awk '{print ($1 == 0)}') -eq 1 ]; then
  index_throughput=0
else
  index_throughput=$(awk "BEGIN {printf \"%.3f\", $documents_indexed / $index_total_time_ms}")
fi

# Output throughput results
echo "Indexer Throughput: $index_throughput documents/millisecond"