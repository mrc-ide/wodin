set -ex

ODIN_API_BRANCH=mrc-3183

docker pull mrcide/odin.api:$ODIN_API_BRANCH
docker run -d --name odin.api --rm -p 8001:8001 mrcide/odin.api:$ODIN_API_BRANCH
