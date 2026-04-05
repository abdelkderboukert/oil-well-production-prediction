# Quick Docker Reference

## Authentication

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Logout
docker logout ghcr.io
```

## Image Management

```bash
# Pull image
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# List local images
docker images | grep oil-well

# Remove image
docker rmi ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Inspect image
docker inspect ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Tag image
docker tag ghcr.io/abdelkderboukert/oil-well-production-prediction:main my-local-tag:latest
```

## Container Operations

```bash
# Run container
docker run --rm ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Run with volumes
docker run --rm -v $(pwd)/data:/app/data ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Run detached (background)
docker run -d --name my-predictor ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Interactive shell
docker run -it --rm ghcr.io/abdelkderboukert/oil-well-production-prediction:main /bin/bash

# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop my-predictor

# Remove container
docker rm my-predictor

# View container logs
docker logs my-predictor

# Follow logs in real-time
docker logs -f my-predictor

# View container resource usage
docker stats my-predictor
```

## Docker Compose

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute command in service
docker-compose exec oil-well-prediction bash

# Rebuild images
docker-compose build

# Remove volumes
docker-compose down -v
```

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove dangling images
docker image prune

# Remove unused volumes
docker volume prune

# Remove all unused resources
docker system prune -a

# Show disk usage
docker system df
```

## Troubleshooting

```bash
# Check docker daemon status
docker ps

# Test image pull
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# View image layers
docker history ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Inspect container
docker inspect <container-id>

# Copy files from container
docker cp <container-id>:/app/path ./local-path

# View event logs
docker events --filter 'container=my-predictor'
```

## Common Workflows

### Local Development

```bash
# Build locally
docker build -t oil-well-local:dev .

# Test locally built image
docker run --rm -v $(pwd)/data:/app/data oil-well-local:dev

# Compare with registry image
docker run --rm -v $(pwd)/data:/app/data \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### Production Deployment

```bash
# Pull latest stable
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Run with resource limits
docker run -d \
  --name oil-well-production \
  --restart always \
  --memory=2g \
  --cpus=2 \
  -v production-data:/app/data \
  -v production-models:/app/models \
  -v production-reports:/app/reports \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### CI/CD Integration

```bash
# In GitHub Actions workflow
- name: Pull and run container
  run: |
    docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }}
    docker run --rm \
      -v ${{ github.workspace }}/data:/app/data \
      ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }}
```

## Port Mapping (if applicable in future)

```bash
# Map ports
docker run -p 8080:8080 ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Map multiple ports
docker run -p 8080:8080 -p 9090:9090 ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# List port mappings
docker port <container-id>
```

## Environment Variables

```bash
# Pass environment variables
docker run \
  -e PYTHONUNBUFFERED=1 \
  -e LOG_LEVEL=DEBUG \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# From file
docker run --env-file .env.docker ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

---

For detailed information, see [DOCKER_REGISTRY_GUIDE.md](DOCKER_REGISTRY_GUIDE.md)
