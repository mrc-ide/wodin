set -ex
ROOT=$(realpath $(dirname $0)/..)

npm install --prefix=$ROOT/app/static
npm run build --prefix=$ROOT/app/static

. $ROOT/scripts/build-backend.sh
