# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /client
COPY package*.json ./
RUN npm install --production=false
COPY . .
# Use build arg with default fallback
ARG NEXT_PUBLIC_API_URL=https://kora-langgraph-1.onrender.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner
WORKDIR /client
ENV NODE_ENV=production
# Set the same environment variable for runtime (optional, for debugging)
ARG NEXT_PUBLIC_API_URL=https://kora-langgraph-1.onrender.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=builder /client/.next ./.next
COPY --from=builder /client/public ./public
COPY --from=builder /client/package*.json ./
RUN npm install --production --ignore-scripts --prefer-offline
EXPOSE 3000
CMD ["npm", "start"]