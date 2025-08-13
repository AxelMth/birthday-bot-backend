# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim AS base

# Install pnpm
RUN npm install -g pnpm

# Install tsx
RUN npm install -g tsx

# Install curl for runtime
RUN apt-get update -qq && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential


# Install node modules
COPY --link package.json .
RUN pnpm install --production=false

# Copy application code
COPY --link . .

# Remove development dependencies
RUN pnpm prune --production


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]
