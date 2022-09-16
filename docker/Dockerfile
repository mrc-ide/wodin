FROM node:16
COPY . /wodin
RUN /wodin/scripts/build.sh
ENTRYPOINT ["/wodin/docker/wodin"]
