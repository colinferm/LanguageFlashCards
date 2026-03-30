# =============================================================================
# German Flashcards – Dockerfile
#
# Three named stages:
#
#   dev-deps  Node 20 image with all dev dependencies installed.
#             Used as the base for both developer workflow and the build.
#
#   builder   Extends dev-deps and runs "gulp build" to produce the
#             optimised static artefacts in /app/build.
#
#   prod      Minimal nginx image that serves only the compiled /app/build
#             output.  No Node, no source code.
#
# Usage:
#   See docker-compose.yml for the recommended workflow.
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 – dev-deps
# ---------------------------------------------------------------------------
FROM node:20-alpine AS dev-deps

# Set working directory
WORKDIR /app

# Copy only the package manifest first so that Docker's layer cache
# is not invalidated when source files change (dependencies rarely change).
COPY package.json ./

# Install all dev dependencies (gulp, browser-sync, etc.)
RUN npm install

# Copy the full project source into the image.
# When used with docker-compose the src/ directory is usually mounted as a
# volume so this layer acts as a fallback for the standalone build target.
COPY . .

# Expose BrowserSync port and its UI port
EXPOSE 3000 3001

# Default command for the dev-deps stage: run the BrowserSync dev server.
# docker-compose overrides this for the build stage.
CMD ["npm", "run", "serve"]


# ---------------------------------------------------------------------------
# Stage 2 – builder
# Compile the production bundle inside the container.
# ---------------------------------------------------------------------------
FROM dev-deps AS builder

RUN npm run build


# ---------------------------------------------------------------------------
# Stage 3 – prod
# Serve the static build output with a minimal nginx image (~25 MB total).
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS prod

# Remove the default nginx site configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy only the compiled artefacts from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
