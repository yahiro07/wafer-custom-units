#!/usr/bin/env bash

set -euo pipefail

cd ./ts && pnpm install && pnpm run build && cd ..
rm -rf dist
cp -r ts/dist dist

for dir in js/*/; do
  cp -r "${dir%/}" dist/
done

