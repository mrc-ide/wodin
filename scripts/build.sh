set -ex

npm install --prefix=app/static
npm run build --prefix=app/static

npm install --prefix=app/server
npm run build --prefix=app/server
