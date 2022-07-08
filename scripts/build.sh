set -ex
ROOT=$(realpath $(dirname $0)/..)

npm install --prefix=$ROOT/app/static
npm run build --prefix=$ROOT/app/static

npm install --prefix=$ROOT/app/server
npm run build --prefix=$ROOT/app/server
