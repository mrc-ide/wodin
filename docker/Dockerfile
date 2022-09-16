FROM ubuntu:jammy

RUN apt-get update \
        && apt-get install -y --no-install-recommends ca-certificates curl \
        && curl -sL https://deb.nodesource.com/setup_16.x | bash \
        && apt-get install -y nodejs

COPY . /wodin
RUN /wodin/scripts/build.sh
ENTRYPOINT ["/wodin/docker/wodin"]
