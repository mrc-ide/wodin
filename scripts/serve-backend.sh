set -ex
ROOT=$(realpath $(dirname $0)/..)

. $ROOT/scripts/build-backend.sh
npm run serve --prefix=$ROOT/app/server
