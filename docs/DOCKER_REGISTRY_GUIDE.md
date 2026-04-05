# Docker Registry & Container Deployment Guide

This guide explains how to use pre-built Docker images from GitHub Container Registry (ghcr.io) and deploy the Oil Well Production Prediction pipeline in containerized environments.

## Table of Contents

1. [Authentication](#authentication)
2. [Pulling Images](#pulling-images)
3. [Running Containers](#running-containers)
4. [Docker Compose](#docker-compose)
5. [Image Tags & Versions](#image-tags--versions)
6. [Troubleshooting](#troubleshooting)

## Authentication

### Prerequisites

- Docker installed ([Docker Desktop](https://www.docker.com/products/docker-desktop))
- GitHub account with access to the repository
- GitHub Personal Access Token (PAT)

### Create GitHub Personal Access Token

1. Visit [GitHub Settings - Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token" → "Generate new token (classic)"
3. Configure token:
   - **Token name**: `docker-registry-token`
   - **Scopes**: Select `read:packages`
   - **Expiration**: 30 days (or as desired)
4. Click "Generate token"
5. **Copy the token** (you won't see it again)

### Login to GitHub Container Registry

#### Using Docker CLI

```bash
# Option 1: Interactive login
docker login ghcr.io

# When prompted:
# Username: <your-github-username>
# Password: <your-github-pat-token>
```

#### Using Environment Variables

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export GITHUB_USERNAME=your-github-username

echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

#### Using the Provided Script

```bash
# Make script executable
chmod +x scripts/docker-registry-login.sh

# Run with your token
./scripts/docker-registry-login.sh ghp_xxxxxxxxxxxxxxxxxxxx your-username
```

#### Verify Authentication

```bash
# Check docker config
cat ~/.docker/config.json | grep ghcr.io

# Test image pull
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

## Pulling Images

### Available Image Tags

| Tag           | Description           | Update Frequency |
| ------------- | --------------------- | ---------------- |
| `main`        | Stable release branch | Every push       |
| `development` | Development branch    | Every push       |
| `v1.0.0`      | Semantic version tag  | Release only     |
| `sha-a1b2c3d` | Commit-specific image | Every push       |
| `latest`      | Latest from main      | Every push       |

### Pull Latest Stable Image

```bash
# From main branch
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# From development branch
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:development

# By commit SHA (first 7 characters)
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:sha-a1b2c3d
```

### View Local Images

```bash
docker images | grep oil-well-production
```

## Running Containers

### Basic Execution

```bash
# Run with current directory mounted
docker run --rm \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### With Volume Mounts

```bash
# Mount data and output directories
docker run --rm \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/plots:/app/plots \
  -v $(pwd)/reports:/app/reports \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### With Environment Variables

```bash
docker run --rm \
  -e PYTHONUNBUFFERED=1 \
  -v $(pwd):/app/work \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### Interactive Shell

```bash
# Access container shell
docker run --rm -it \
  -v $(pwd):/app/work \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main \
  /bin/bash
```

### Named Container with Logging

```bash
docker run --rm \
  --name oil-well-pipeline \
  --log-driver json-file \
  --log-opt max-size=10m \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/output:/app/output \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# View logs
docker logs -f oil-well-pipeline
```

### Resource Limits

```bash
docker run --rm \
  --memory=2g \
  --cpus=2 \
  -v $(pwd):/app/work \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

## Docker Compose

### Using docker-compose.yml

```bash
# Run with default configuration
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Build locally and run
docker-compose -f docker-compose.yml build
docker-compose up
```

### Custom Configuration

Create `docker-compose.override.yml`:

```yaml
version: "3.8"

services:
  oil-well-prediction:
    environment:
      - LOG_LEVEL=DEBUG
    volumes:
      - ./custom-data:/app/data
```

Run with override:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

## Image Tags & Versions

### Branch Tags

Images are automatically tagged by branch:

```
Development Branch:
ghcr.io/abdelkderboukert/oil-well-production-prediction:development

Main Branch:
ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

### Semantic Versioning

When creating GitHub release with tag `v1.0.0`:

```
ghcr.io/abdelkderboukert/oil-well-production-prediction:v1.0.0
ghcr.io/abdelkderboukert/oil-well-production-prediction:1.0
ghcr.io/abdelkderboukert/oil-well-production-prediction:1
```

### Commit SHA

Every commit generates a unique image:

```
ghcr.io/abdelkderboukert/oil-well-production-prediction:sha-a1b2c3d
```

## Troubleshooting

### Authentication Error

```
Error response from daemon: pull access denied for ghcr.io/...
```

**Solution:**

1. Verify GitHub PAT has `read:packages` scope
2. Re-authenticate: `docker logout ghcr.io && docker login ghcr.io`
3. Check token hasn't expired

### Image Not Found

```
Error response from daemon: manifest not found
```

**Solutions:**

1. Verify image exists: `docker search ghcr.io/...` (may not work for private registries)
2. Check branch name is correct
3. Wait for workflow to complete (check GitHub Actions)

### Permission Denied on Volume Mounts

```
PermissionError: [Errno 13] Permission denied: './data/...'
```

**Solution:**

```bash
# Fix permissions
sudo chown -R $(id -u):$(id -g) ./data ./models ./plots ./reports

# Or run with user flag
docker run --user $(id -u):$(id -g) ...
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove specific image
docker rmi ghcr.io/abdelkderboukert/oil-well-production-prediction:tag
```

### Container Exits Immediately

**Check logs:**

```bash
docker logs <container-id>
```

**Common causes:**

- Missing data files in mounted volumes
- Configuration file not accessible
- Insufficient memory

### Slow Performance

```bash
# Check resource allocation
docker stats

# Increase available resources in Docker Desktop settings
```

## Best Practices

1. **Use Specific Tags**: Avoid `latest`; use version tags for reproducibility
2. **Pin Dependencies**: Use pinned `requirements.txt` versions
3. **Small Images**: Use multi-stage builds (already configured)
4. **Security Scanning**: Images are scanned with Trivy and Grype before push
5. **Logs**: Enable logging driver for debugging

## Integration Examples

### Kubernetes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: oil-well-prediction
spec:
  containers:
    - name: predictor
      image: ghcr.io/abdelkderboukert/oil-well-production-prediction:main
      volumeMounts:
        - name: data
          mountPath: /app/data
      resources:
        limits:
          memory: "2Gi"
          cpu: "2"
  volumes:
    - name: data
      emptyDir: {}
```

### AWS ECR Replication

```bash
# Copy image to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main
docker tag oil-well-production:main <account>.dkr.ecr.us-east-1.amazonaws.com/oil-well-production:main
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/oil-well-production:main
```

### GitHub Codespaces

```bash
# Build and run in GitHub Codespaces
gh codespace create --repo abdelkderboukert/oil-well-production-prediction
gh codespace ssh

# Inside codespace
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main
docker run --rm -v /workspaces/oil-well-production-prediction:/app/work ...
```

## Security Considerations

- All images are scanned for vulnerabilities (Trivy, Grype)
- Non-root user execution enforced
- Base image regularly updated
- Dependencies updated via Dependabot
- No secrets embedded in images

See [SECURITY.md](../SECURITY.md) for detailed security information.

---

**Last Updated**: April 5, 2026
