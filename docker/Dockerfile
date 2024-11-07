FROM node:20

COPY . /wodin
RUN /wodin/scripts/build.sh && \
        cp ./wodin/docker/update-site ./wodin/docker/update-sites /usr/local/bin

ENTRYPOINT ["/wodin/docker/wodin"]
