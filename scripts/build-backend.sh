set -ex
ROOT=$(realpath $(dirname $0)/..)

npm ci --prefix=$ROOT/app/server
npm run build --prefix=$ROOT/app/server
