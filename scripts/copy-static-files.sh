ROOT=$(realpath $(dirname $0)/..)
PUBLIC_FOLDER=$ROOT/app/server/public
cp $1/index.html $PUBLIC_FOLDER && cp -r $1/files $PUBLIC_FOLDER && cp -r $1/help $PUBLIC_FOLDER
