#!/usr/bin/env bash
# Retry a command up to a specific number of times until it exits successfully
# Usage: scripts/retry.sh <retries> <command>

retries="$1"
command="$2"

echo trying "$command", $retries retries left

# Run the command, and save the exit code
($command)
exit_code=$?

# If the exit code is non-zero (i.e. command failed), and we have not
# reached the maximum number of retries, run the command again
if [[ $exit_code -ne 0 && $retries -gt 0 ]]; then
  eval "$(dirname "$0")/retry.sh" $(($retries - 1)) "\"${command}\""
else
  # Return the exit code from the command
  exit $exit_code
fi

