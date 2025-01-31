#!/bin/bash

# Test script for the query component

# Initialize counters and timers
query_start_time=$(date +%s)
queries_processed=0

cd "$(dirname "$0")" || exit 1

while read -r url; do
  if [[ "$url" == "stop" ]]; then
    echo "[engine] stopping crawler: 'stop' signal received" >&2
    break
  fi

  echo "[engine] crawling $url" >&2
  ./crawl.sh "$url" > d/content.txt

  # Add the URL to visited.txt
  echo "$url" >> d/visited.txt

  echo "[engine] indexing $url" >&2
  ./index.sh d/content.txt "$url"

  # Increment the query counter since we're assuming each URL processed is a query
  ((queries_processed++))

  # Debug: Print the number of lines in visited.txt and urls.txt
  visited_count=$(wc -l < d/visited.txt)
  urls_count=$(wc -l < d/urls.txt)
  echo "[debug] visited.txt lines: $visited_count, urls.txt lines: $urls_count" >&2

  if [[ "$visited_count" -ge "$urls_count" ]]; then
    echo "[engine] stopping crawler: all URLs visited" >&2
    break
  fi

done < <(tail -f d/urls.txt)

# Calculate throughput
query_end_time=$(date +%s)
query_total_time=$((query_end_time - query_start_time))

if [ "$query_total_time" -eq 0 ]; then
  query_throughput=0
else
  # Corrected awk command
  query_throughput=$(awk "BEGIN {printf \"%.2f\", $queries_processed / $query_total_time}")
fi

# Output throughput results
echo "Query Throughput: $query_throughput queries/second"