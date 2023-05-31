###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development
ARG BUILD_CONTEXT

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
# COPY --chown=node:node ./packages/$BUILD_CONTEXT/package.json packages/$BUILD_CONTEXT/

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN yarn install 

# Use the node user from the image (instead of the root user)
USER node