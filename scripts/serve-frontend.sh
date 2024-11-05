set -ex
ROOT=$(realpath $(dirname $0)/..)

npm install --prefix=$ROOT/app/static
npm run dev --prefix=$ROOT/app/static
