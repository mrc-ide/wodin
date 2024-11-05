set -ex
ROOT=$(realpath $(dirname $0)/..)

. $ROOT/scripts/build-backend.sh
npm run serve-hot --prefix=$ROOT/app/server
