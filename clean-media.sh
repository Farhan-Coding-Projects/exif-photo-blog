#!/usr/bin/env bash
#
# clean-media.sh — delete all .mp4 and .dng files from the repository.
#
# Usage:
#   ./clean-media.sh            # dry run: list what would be deleted
#   ./clean-media.sh --delete   # actually delete the files
#
set -euo pipefail

# Run from the repo root regardless of where the script is invoked.
cd "$(dirname "$0")"

DELETE=false
[ "${1:-}" = "--delete" ] || [ "${1:-}" = "-f" ] && DELETE=true

# Find all .mp4/.dng files, skipping node_modules and .git.
# -print0 / -d '' keeps filenames with spaces or newlines safe.
find_media() {
  find . \
    \( -path ./node_modules -o -path ./.git \) -prune -o \
    -type f \( -name '*.mp4' -o -name '*.dng' \) -print0
}

count=$(find_media | tr -d -c '\0' | wc -c | tr -d ' ')

if [ "$count" -eq 0 ]; then
  echo "No .mp4 or .dng files found."
  exit 0
fi

find_media | tr '\0' '\n'
echo "----"
echo "Found ${count} file(s)."

if [ "$DELETE" = false ]; then
  echo "Dry run. Re-run with --delete to remove them."
  exit 0
fi

find_media | xargs -0 rm -f
echo "Deleted ${count} file(s)."
