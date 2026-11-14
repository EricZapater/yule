# Build stage
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /server ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /simulador ./cmd/simulador

# Final minimal stage
FROM alpine:3.20
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /server .
COPY --from=builder /simulador .
COPY --from=builder /app/internal/db/migrations ./internal/db/migrations
RUN mkdir -p /app/uploads/photos
VOLUME ["/app/uploads/photos"]
EXPOSE 8080
CMD ["./server"]
