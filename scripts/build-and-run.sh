set -ex

HERE=$(realpath "$(dirname $0)")
. $HERE/build.sh

npm run serve --prefix=app/server
