#!/bin/bash

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

term="stuff"

# Copy the global index file
cat "$T_FOLDER"/d/d7.txt > d/global-index.txt

# Measure the start time
start_time=$(date +%s.%N)

# Run the query
./query.js "$term" > query_output.txt

# Measure the end time
end_time=$(date +%s.%N)

# Calculate the elapsed time using awk
elapsed_time=$(awk -v start="$start_time" -v end="$end_time" 'BEGIN {print end - start}')

# Calculate throughput (queries per second) using awk
throughput=$(awk -v et="$elapsed_time" 'BEGIN {printf "%.2f", 1 / et}')

# Print the throughput
echo "Query Throughput: $throughput queries/second"

# Compare the query output with the expected output
if $DIFF <(cat query_output.txt) <(cat "$T_FOLDER"/d/d8.txt) >&2;
then
    echo "$0 success: search results are identical"
    exit 0
else
    echo "$0 failure: search results are not identical"
    exit 1
fi