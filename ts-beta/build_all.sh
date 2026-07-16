#!/usr/bin/env bash

set -euo pipefail

dstDir=./dist
rm -rf "$dstDir"
mkdir -p "$dstDir"
cd ./aura && pnpm run build && cd ..
cd ./cadence && pnpm run build && cd ..
cd ./jw-guitar-amp && pnpm run build && cd ..
cd ./model-1 && pnpm run build && cd ..
cd ./poly-synth && pnpm run build && cd ..
cd ./react-synth && pnpm run build && cd ..
cd ./sk-synth && pnpm run build && cd ..
cd ./super-oscillator && pnpm run build && cd ..
cd ./syntho && pnpm run build && cd ..
cd ./vue-synth && pnpm run build && cd ..

echo "build done."
