set -ex

npm run static-build --prefix=app/static
npm run build-static-site --prefix=app/server

sleep 1

npm run static-serve --prefix=app/server
