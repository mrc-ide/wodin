FROM ubuntu:jammy

RUN apt-get update \
        && apt-get install -y --no-install-recommends ca-certificates curl \
        && curl -sL https://deb.nodesource.com/setup_20.x | bash \
        && apt-get install -y git nodejs

COPY . /wodin
RUN /wodin/scripts/build.sh && \
        cp ./wodin/docker/update-site ./wodin/docker/update-sites /usr/local/bin
ENTRYPOINT ["/wodin/docker/wodin"]
