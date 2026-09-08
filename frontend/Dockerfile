ARG BACKEND_URL=http://localhost:5000
ARG WORKFLOW_SERVICE_URL=http://localhost:8000

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build with env vars baked in
ARG VITE_API_URL=${BACKEND_URL}/api
ARG VITE_WORKFLOW_SERVICE_URL=${WORKFLOW_SERVICE_URL}
ENV VITE_API_URL=${BACKEND_URL}/api
ENV VITE_WORKFLOW_SERVICE_URL=${WORKFLOW_SERVICE_URL}
RUN npm run build

FROM nginx:alpine
# Substitute placeholders in nginx.conf
COPY nginx.conf /tmp/nginx.conf.template
RUN sed "s|\${BACKEND_URL}|${BACKEND_URL}|g; s|\${WORKFLOW_SERVICE_URL}|${WORKFLOW_SERVICE_URL}|g" \
    /tmp/nginx.conf.template > /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
