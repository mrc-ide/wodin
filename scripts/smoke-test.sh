#!/usr/bin/env bash

retries=10
sleep 20;

while ((retries > 0)); do
    curl http://localhost:3000 | grep "Example WODIN configuration" && break

    echo "retrying connection with server in 1 seconds"
    sleep 1
    ((retries --))
done

if ((retries == 0 )); then
    echo "Didn't get expected response from the server"
    exit 1
fi
