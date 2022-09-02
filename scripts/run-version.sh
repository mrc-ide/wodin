#!/usr/bin/env bash
set -eEo pipefail

API_BRANCH=main
APP_BRANCH=main

USAGE="Usage: $0 [--app REF | --api REF]"

function check_arg_or_die {
    if [ "$#" -ne 2 ]; then
        echo "Expected argument for $1"
        echo $USAGE
        exit 1
    fi
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --api)
            API_BRANCH=$2
            check_arg_or_die $2 "--api"
            shift 2
            # shift
            ;;
        --app)
            APP_BRANCH=$2
            check_arg_or_die $2 "--app"
            shift 2
            # shift
            ;;
        --help)
            echo $USAGE
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            echo $USAGE
            exit 1
            ;;
    esac
done

API_IMAGE=mrcide/odin.api:$API_BRANCH
APP_IMAGE=mrcide/wodin:$APP_BRANCH
REDIS_IMAGE=redis:6

API_NAME=odin.api
APP_NAME=wodin
REDIS_NAME=redis

# Should read this from the config, really
WODIN_PORT=3000

# What this script does not do, which a robust version would, is make
# sure that all ports and container names are available. At present
# it's a bit easy to bring up a partial deployment. Unfortunately
# docker / bash makes that pretty tedious to get right.

ROOT=$(realpath $(dirname $(dirname "$0")))
echo "Using wodin root at $ROOT"
echo "  * app branch: $APP_BRANCH"
echo "  * api branch: $API_BRANCH"
echo "  * wodin port: $WODIN_PORT"
echo
echo "If things don't come up as expected, check docker ps and take down any other wodin instances"
echo

function cleanup() {
  set +e
  docker kill $API_NAME
  docker kill $APP_NAME
  docker kill $REDIS_NAME
}
trap cleanup EXIT

docker pull $API_IMAGE
docker run -d --name $API_NAME --rm -p 8001:8001 $API_IMAGE
docker run -d --name $REDIS_NAME --rm -p 6379:6379 $REDIS_IMAGE

# Pulling here should give enough time for the deps to start up - that
# should be really quick.  Note that we use host networking as that
# matches the values in the configuration.
docker pull $APP_IMAGE
docker run -d --name $APP_NAME --rm -v $ROOT/config:/config:ro --network=host $APP_IMAGE /config

# From now on, if the user presses Ctrl+C we should teardown gracefully
# Wait for Ctrl+C
echo "wodin now available at http://localhost:$WODIN_PORT"
echo "Ready to use. Press Ctrl+C to teardown."
sleep infinity
