set -ex
ROOT=$(realpath $(dirname $0)/..)

npm install --prefix=$ROOT/app/static
npm run copy-bootstrap --prefix=$ROOT/app/static
APPTYPE="$1" npm run serve-app --prefix=$ROOT/app/static
