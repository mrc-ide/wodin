set -ex

HERE=$(realpath "$(dirname $0)")
. $HERE/build.sh

CONCURRENTLY_MAX_PROCESSES=1 npm run serve --prefix=app/server
