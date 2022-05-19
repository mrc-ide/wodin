#!/usr/bin/env bash
set -ex

HERE=$(dirname "$0")

"$HERE"/run-dependencies.sh

# From now on, if the user presses Ctrl+C we should teardown gracefully
function cleanup() {
  docker kill odin.api
}
trap cleanup EXIT

# Wait for Ctrl+C
echo "Ready to use. Press Ctrl+C to teardown."
sleep infinity
