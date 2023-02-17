set -ex
ROOT=$(realpath $(dirname $0)/..)

npm install --prefix=$ROOT/app/static
npm run serve-"$1" --prefix=$ROOT/app/static