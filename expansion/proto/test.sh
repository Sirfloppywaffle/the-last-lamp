#!/bin/sh
# Runs the full game suite, plus forks.test.js, against the prototype in a throwaway copy of the repo.
# The real index.html is never touched. Needs tests/node_modules (cd tests && npm install).
set -e
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
python3 "$ROOT/expansion/proto/forks.py" --bare
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
(cd "$ROOT" && git ls-files | grep -v '^expansion/' | tar -cf - -T -) | (cd "$TMP" && tar -xf -)
cp "$ROOT/expansion/proto/forks.html" "$TMP/index.html"
cp "$ROOT/expansion/proto/forks.test.js" "$TMP/tests/t/forks.test.js"
ln -s "$ROOT/tests/node_modules" "$TMP/tests/node_modules"
cd "$TMP/tests" && node run.js "$@"
