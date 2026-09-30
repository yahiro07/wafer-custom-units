#!/usr/bin/env bash
# Download all MP3 samples referenced by rompler_dsp.js into this directory.
set -euo pipefail

cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-https://aikelab.net/pg01/mp3}"
NUM_NOTE=13

# Unique filenames per note (0101 is listed twice in Key(); same file).
SUFFIXES=(
  0000.mp3
  0001.mp3
  0002.mp3
  0003.mp3
  0101.mp3
  0102.mp3
  0103.mp3
  01re.mp3
)

ok=0
skip=0
fail=0

for ((i = 0; i < NUM_NOTE; i++)); do
  note=$(printf "%02d" "$i")
  for suffix in "${SUFFIXES[@]}"; do
    file="${note}${suffix}"
    url="${BASE_URL}/${file}"
    if [[ -f "$file" && -s "$file" ]]; then
      echo "skip  $file"
      skip=$((skip + 1))
      continue
    fi
    echo "get   $file"
    if curl -fL --retry 3 --retry-delay 1 -o "$file" "$url"; then
      ok=$((ok + 1))
    else
      echo "fail  $file" >&2
      rm -f "$file"
      fail=$((fail + 1))
    fi
  done
done

echo
echo "downloaded: $ok  skipped: $skip  failed: $fail"
exit $((fail > 0 ? 1 : 0))
