FROM denoland/deno:latest AS builder

WORKDIR /app

# Copy workspace root and lock
COPY deno.json deno.lock ./

# Copy backend for workspace member
COPY backend ./backend

# Copy frontend
COPY frontend ./frontend

WORKDIR /app/frontend

# Install dependencies - Deno will use node_modules
RUN deno install --node-modules-dir

RUN deno task build

FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
