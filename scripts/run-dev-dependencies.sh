#!/usr/bin/env bash
set -ex

HERE=$(dirname "$0")

"$HERE"/run-dependencies.sh

# From now on, if the user presses Ctrl+C we should teardown gracefully
function cleanup() {
  set +x
  docker kill odin.api
  docker kill wodin-redis
}
trap cleanup EXIT

# Wait for Ctrl+C
echo "Ready to use. Press Ctrl+C to teardown."
sleep infinity
