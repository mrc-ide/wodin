#!/usr/bin/env bash
set -ex

ODIN_API_BRANCH=mrc-3182-next

docker pull mrcide/odin.api:$ODIN_API_BRANCH
docker run -d --name odin.api --rm -p 8001:8001 mrcide/odin.api:$ODIN_API_BRANCH
docker run -d --name wodin-redis --rm -p 6379:6379 redis:6
