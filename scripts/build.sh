set -ex
ROOT=$(realpath $(dirname $0)/..)

npm ci --prefix=$ROOT/app/static
npm run build-with-check --prefix=$ROOT/app/static

. $ROOT/scripts/build-backend.sh
