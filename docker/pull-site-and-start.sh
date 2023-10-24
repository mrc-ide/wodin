#!/usr/bin/env bash
set -ex
HERE=$(dirname "$0")

git clone --depth 1 --branch $1 $2 $3

shift 3

"$HERE"/wodin $*