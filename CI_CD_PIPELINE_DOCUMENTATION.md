# CI/CD Pipeline Documentation

## Overview

This document describes the Jenkins CI/CD pipeline for the Oil Well Production Prediction project, including security scanning, testing, and deployment stages.

## Pipeline Architecture

### Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Initialize & Checkout                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│          Global Security Scanning (Parallel)                  │
│  ├─ Secret Scanning (Gitleaks + TruffleHog)                 │
│  └─ Dependency Vulnerability Check (Trivy)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│      Component Pipelines (AI, Frontend, Backend)             │
│  For each component:                                         │
│  ├─ Setup & Linting                                         │
│  ├─ SAST Analysis (Semgrep)                                │
│  ├─ Unit Tests & Coverage                                   │
│  ├─ Build Docker Image                                      │
│  └─ Image Vulnerability Scanning                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            Infrastructure Validation (Main Only)             │
│  ├─ Terraform Format Check                                  │
│  └─ Terraform Validation                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│         Generate Consolidated Security Report                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│           Archive Results & Post-Actions                      │
└─────────────────────────────────────────────────────────────┘
```

## Stages Detail

### 1. Initialize & Checkout

- **Purpose**: Prepare workspace and clone repository
- **Tools**: Jenkins SCM
- **Outputs**: Clean workspace with latest code
- **Duration**: ~30 seconds

### 2. Global Security Scanning

Runs in parallel for all code:

#### 2.1 Secret Scanning

- **Tool**: Gitleaks + TruffleHog
- **Detects**:
  - AWS Access Keys
  - GitHub Tokens
  - Private SSH Keys
  - Database Passwords
  - API Keys
- **Output**: `reports/secrets-scan.txt`
- **Failure Action**: Warning (non-blocking)

#### 2.2 Dependency Vulnerability Check

- **Tool**: Trivy
- **Scans**:
  - OS vulnerabilities
  - Library vulnerabilities
  - Known CVEs
- **Severity Levels**: CRITICAL, HIGH, MEDIUM
- **Output**: `reports/dependency-scan.txt`

### 3. Component Pipelines

#### 3.1 AI Component

**Triggers On**: Main, dev-\* branches

**Stages**:

1. **Setup & Lint**
   - Install Python dependencies
   - Run Black code formatter check
   - Run isort import sorting check
   - Run Flake8 linting
   - **Output**: Console output
   - **Duration**: ~2 minutes

2. **SAST Analysis**
   - Semgrep with security audit rules
   - **Output**: `reports/ai-sast.txt`
   - **Duration**: ~3 minutes

3. **Unit Tests**
   - Run pytest with coverage
   - **Minimum Coverage**: 80% (fail at 70%)
   - **Output**:
     - `reports/ai-tests.xml` (JUnit format)
     - Coverage HTML report
   - **Duration**: ~5 minutes

4. **Build Docker Image**
   - Build AI model serving image
   - Tags: `${BUILD_NUMBER}` and `latest`
   - **Duration**: ~2 minutes

5. **Image Scanning**
   - Trivy container scanning
   - Detects vulnerabilities in base images
   - **Output**: `reports/ai-image-scan.txt`

#### 3.2 Frontend Component

**Triggers On**: Main, dev-\* branches

**Stages**:

1. **Setup & Lint**
   - Install npm dependencies
   - Run ESLint
   - **Output**: Console output
   - **Duration**: ~3 minutes

2. **SAST Analysis**
   - Semgrep with TypeScript/React security rules
   - npm audit for dependency vulnerabilities
   - **Output**: `reports/frontend-sast.txt`

3. **Build**
   - Next.js build process
   - **Duration**: ~5 minutes

4. **Build Docker Image**
   - Build frontend container
   - **Duration**: ~2 minutes

#### 3.3 Backend Component

**Triggers On**: Main, dev-\* branches

**Stages**:

1. **Setup & Lint**
   - Install Python dependencies
   - Run Black, isort, Flake8
   - **Duration**: ~2 minutes

2. **SAST Analysis**
   - Semgrep with Django security rules
   - OWASP Top 10 detection
   - **Output**: `reports/backend-sast.txt`

3. **Unit Tests**
   - Django test suite
   - **Output**: `reports/backend-tests.txt`
   - **Duration**: ~5 minutes

4. **Build Docker Image**
   - Build backend API container
   - **Duration**: ~2 minutes

### 4. Infrastructure Validation

**Triggers On**: Main branch only

- Validates Terraform configurations
- Checks formatting consistency
- Runs terraform plan (dry-run)
- **Output**: Console output

### 5. Generate Security Report

Consolidates all security findings into:

- **File**: `reports/SECURITY_SUMMARY.md`
- **Contents**:
  - Build metadata
  - Secret scan results
  - Vulnerability findings
  - Compliance status

## Branching Strategy

| Branch  | Trigger | Stages                                 | Deploy          |
| ------- | ------- | -------------------------------------- | --------------- |
| `dev-*` | All     | All (except infrastructure validation) | No              |
| `main`  | All     | All                                    | Manual approval |
| Other   | On PR   | Security scans only                    | No              |

## Security Scanning Details

### Secret Detection

**Gitleaks** scans for:

- AWS credentials
- GitHub tokens
- Private keys (RSA, DSA, PGP)
- Slack tokens
- Generic API keys

**Configuration**:

```bash
gitleaks detect --source=. --verbose --redact
```

### Static Application Security Testing (SAST)

**Semgrep** rules applied:

- OWASP Top 10
- CWE Top 25
- Python-specific rules
- TypeScript/React-specific rules
- Django-specific rules

**Severity**: HIGH and above fail the build

### Software Composition Analysis (SCA)

**Trivy** detects:

- OS package vulnerabilities
- Library vulnerabilities
- CVEs with severity > MEDIUM

### Container Image Scanning

**Trivy image scan** checks:

- Base OS vulnerabilities
- Installed dependency vulnerabilities
- Configuration issues

## Test Coverage Requirements

| Component | Min Coverage | Fail Threshold |
| --------- | ------------ | -------------- |
| AI        | 80%          | 70%            |
| Backend   | 80%          | 70%            |
| Frontend  | 60%          | 40%            |

## Artifact Archival

**Generated Artifacts**:

- `reports/secrets-scan.txt`
- `reports/dependency-scan.txt`
- `reports/ai-sast.txt`
- `reports/ai-tests.xml`
- `reports/frontend-sast.txt`
- `reports/backend-sast.txt`
- `reports/backend-tests.txt`
- `reports/ai-image-scan.txt`
- `reports/SECURITY_SUMMARY.md`
- Coverage reports (HTML)

**Retention Policy**:

- General artifacts: 30 days
- Security reports: 90 days
- Test reports: 60 days

## Prerequisites for Pipeline Execution

### Jenkins Plugins Required

```
- Pipeline
- Blue Ocean
- Docker
- Kubernetes
- Git
- Trivy
- Semgrep
- Email Extension
- Slack Notification
- HTML Publisher
```

### Tools Required on Jenkins Agent

```
- Python 3.11+
- Node.js 18+
- Docker
- kubectl
- terraform
- gitleaks
- trufflehog
- semgrep
- trivy
- npm
- pip
```

### Environment Variables Required

```
REGISTRY=your-registry.azurecr.io
IMAGE_NAME=oil-well-prediction
PYTHON_VERSION=3.11
GIT_BRANCH=<from SCM>
BUILD_NUMBER=<from Jenkins>
```

### Credentials Required

```
- docker-registry-creds: Docker Registry authentication
- git-ssh-key: GitHub SSH key
- aws-credentials: AWS credentials for deployments
- k8s-config: Kubernetes configuration
```

## Troubleshooting

### Common Issues

#### Issue: "docker: command not found"

**Solution**: Ensure Docker is installed on Jenkins agent

```bash
sudo apt-get install docker.io
sudo usermod -aG docker jenkins
```

#### Issue: "Permission denied" on docker commands

**Solution**: Add Jenkins user to docker group

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### Issue: Trivy/Gitleaks not found

**Solution**: Install missing tools

```bash
# Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s

# Gitleaks
wget https://github.com/gitleaks/gitleaks/releases/download/v8.x.x/gitleaks-linux-x64
chmod +x gitleaks-linux-x64 && mv gitleaks-linux-x64 /usr/local/bin/gitleaks
```

### Debugging

Enable verbose logging in Jenkins:

```groovy
options {
    timestamps()
    ansiColor('xterm')
}
```

## Performance Optimization

### Parallel Execution

- Global security scans run in parallel
- Components (AI, Frontend, Backend) run sequentially but could be parallelized
- All stages report independently

### Caching

- Docker layer caching
- pip cache: `~/.cache/pip`
- npm cache: `~/.npm`

### Timeout Configuration

- Default: 1 hour per pipeline execution
- Adjustable per stage as needed

## Security Best Practices

1. **Never commit secrets**: Use Jenkins credentials
2. **Always scan dependencies**: Trivy + npm audit
3. **Review SAST findings**: Check semgrep output
4. **Maintain coverage**: Keep tests > 70%
5. **Keep tools updated**: Regular semgrep rule updates
6. **Rotate credentials**: Change registry credentials regularly
7. **Monitor reports**: Review security findings weekly

## Next Steps

1. **Configure Jenkins**:
   - Install required plugins
   - Set environment variables
   - Add credentials

2. **Install Tools**:
   - Set up Docker
   - Install security scanners

3. **Test Pipeline**:
   - Run on dev branch first
   - Verify artifacts
   - Check reports

4. **Monitor & Iterate**:
   - Review false positives
   - Tune severity thresholds
   - Optimize performance

## Contact & Support

- **Security Issues**: security-team@company.com
- **Pipeline Issues**: devops-team@company.com
- **Incidents**: incident-management-system

---

**Last Updated**: 2026-05-24
**Maintained By**: DevOps & Security Teams
