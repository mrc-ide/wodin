#!/usr/bin/env bash
set -ex
HERE=$(dirname "$0")

git clone --branch $1 $2 $3

shift
shift
shift

"$HERE"/wodin $*