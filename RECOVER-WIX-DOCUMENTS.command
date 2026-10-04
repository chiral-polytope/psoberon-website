#!/bin/bash
# Mac launcher. Reads the live website and saves files only in this project.
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf '\nNode.js is needed. See START-HERE.html, install Node.js, and try again.\n'
  read -r -p 'Press Return to close.' unused
  exit 1
fi
node scripts/recover-wix.mjs
result=$?
printf '\nNo changes were made to your Wix site or domain.\n'
read -r -p 'Press Return to close.' unused
exit "$result"
