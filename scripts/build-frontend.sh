set -ex
npm run build-"$1" --prefix=app/static
npm run copy-all --prefix=app/static
