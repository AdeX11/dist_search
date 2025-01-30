#!/bin/bash

# Set default directories if not already set
T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

# Navigate to the parent directory of the script; exit if can't change directory
cd "$(dirname "$0")/../..$R_FOLDER" || exit 1

# Use diff command with default being 'diff' if not set
DIFF=${DIFF:-diff}

# Define test cases directly in the script
TEST_CASES="ate computers computer computation eats eating running ran"

# Define expected stemmed output
EXPECTED_OUTPUT="at
comput
comput
comput
eat
eat
run
ran"

# Run stem.js with the test cases and compare with expected output
if $DIFF <(echo "$TEST_CASES" | c/stem.js | sort) <(echo "$EXPECTED_OUTPUT" | sort) >&2; then
    echo "$0 success: stemmed words are identical"
    exit 0
else
    echo "$0 failure: stemmed words are not identical" >&2
    exit 1
fi