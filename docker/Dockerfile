FROM node:16-buster
COPY . /wodin
RUN /wodin/scripts/build.sh
ENTRYPOINT ["/wodin/docker/wodin"]
