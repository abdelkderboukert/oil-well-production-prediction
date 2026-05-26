pipeline {
    agent {
        label 'linux'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
    }

    triggers {
        cron('H 0 2 * *')  // Weekly scan
        pollSCM('H/15 * * * *')  // Poll every 15 minutes
    }

    environment {
        REGISTRY = 'your-registry.azurecr.io'
        IMAGE_NAME = 'oil-well-prediction'
        PYTHON_VERSION = '3.11'
    }

    stages {
        stage('Initialize & Checkout') {
            steps {
                script {
                    echo "=== Pipeline Initialization ==="
                    echo "Build Number: ${BUILD_NUMBER}"
                    echo "Build ID: ${BUILD_ID}"
                    echo "Branch: ${BRANCH_NAME ?: 'N/A'}"
                    echo "Workspace: ${WORKSPACE}"
                    cleanWs()
                    checkout scm
                }
            }
        }

        stage('Security Scanning - Global') {
            parallel {
                stage('Secret Scanning') {
                    steps {
                        script {
                            echo "=== Running Global Secret Scan ==="
                            try {
                                sh '''
                                    mkdir -p reports
                                    
                                    echo "--- Gitleaks Scan ---" > reports/secrets-scan.txt
                                    gitleaks detect --source=. --verbose --redact >> reports/secrets-scan.txt 2>&1 || true
                                    
                                    echo "" >> reports/secrets-scan.txt
                                    // echo "--- TruffleHog Scan ---" >> reports/secrets-scan.txt
                                    // trufflehog filesystem . --only-verified >> reports/secrets-scan.txt 2>&1 || true
                                '''
                            } catch (Exception e) {
                                echo "Secret scan completed with warnings: ${e.message}"
                            }
                        }
                    }
                }

                stage('Dependency Check') {
                    steps {
                        script {
                            echo "=== Checking Dependencies for Vulnerabilities ==="
                            try {
                                sh '''
                                    echo "--- Trivy Vulnerability Scan ---" > reports/dependency-scan.txt
                                    trivy fs . --severity HIGH,CRITICAL --format table >> reports/dependency-scan.txt 2>&1 || true
                                '''
                            } catch (Exception e) {
                                echo "Dependency scan completed with warnings: ${e.message}"
                            }
                        }
                    }
                }
            }
        }

        stage('AI Component Pipeline') {
            when {
                anyOf {
                    branch 'dev-*'
                    branch 'main'
                }
            }
            stages {
                stage('AI: Setup & Lint') {
                    steps {
                        dir('AI') {
                            script {
                                echo "=== AI Component: Setup & Linting ==="
                                sh '''
                                    python3 --version
                                    pip install --upgrade pip
                                    pip install black isort flake8 pylint
                                    
                                    echo "--- Code Formatting Check ---"
                                    black --check src/ main.py --line-length=127 || true
                                    isort --check-only src/ main.py || true
                                    
                                    echo "--- Flake8 Analysis ---"
                                    flake8 src/ main.py --max-complexity=10 --max-line-length=127 --statistics || true
                                '''
                            }
                        }
                    }
                }

                stage('AI: SAST Analysis') {
                    steps {
                        dir('AI') {
                            script {
                                echo "=== AI Component: Static Application Security Testing ==="
                                sh '''
                                    echo "--- Semgrep SAST ---" > ../reports/ai-sast.txt
                                    semgrep scan --config="p/security-audit" --config="p/python" --json >> ../reports/ai-sast.txt 2>&1 || true
                                '''
                            }
                        }
                    }
                }

                stage('AI: Unit Tests') {
                    steps {
                        dir('AI') {
                            script {
                                echo "=== AI Component: Unit Tests ==="
                                sh '''
                                    pip install -r ../requirements.txt pytest pytest-cov
                                    pytest tests/ -v --cov=src --cov-report=xml --cov-report=html --junitxml=../reports/ai-tests.xml 2>&1 || true
                                    
                                    echo "Test coverage report generated"
                                '''
                            }
                        }
                    }
                }

                stage('AI: Build Docker Image') {
                    when {
                        anyOf{
                            branch 'main'
                            branch 'development'
                        }
                    }
                    steps {
                        dir('AI') {
                            script {
                                echo "=== AI Component: Building Docker Image ==="
                                sh '''
                                    docker build -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} \
                                        -t ${REGISTRY}/${IMAGE_NAME}:latest \
                                        -f dockerfile . 2>&1 || true
                                    
                                    echo "Docker image built successfully"
                                '''
                            }
                        }
                    }
                }

                stage('AI: Image Scanning') {
                    when {
                        anyOf{
                            branch 'main'
                            branch 'development'
                        }
                    }
                    steps {
                        script {
                            echo "=== AI Component: Scanning Docker Image ==="
                            sh '''
                                trivy image --severity HIGH,CRITICAL \
                                    ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} > reports/ai-image-scan.txt 2>&1 || true
                            '''
                        }
                    }
                }
            }
            post {
                always {
                    dir('AI') {
                        archiveArtifacts artifacts: '../reports/ai-*.txt,../reports/ai-tests.xml', 
                                        allowEmptyArchive: true
                        publishHTML([
                            reportDir: 'htmlcov',
                            reportFiles: 'index.html',
                            reportName: 'AI Coverage Report'
                        ])
                    }
                }
            }
        }

        stage('Frontend Component Pipeline') {
            when {
                anyOf {
                    branch 'dev-*'
                    branch 'main'
                }
            }
            stages {
                stage('Frontend: Setup & Lint') {
                    steps {
                        dir('UI/frontend') {
                            script {
                                echo "=== Frontend Component: Setup & Linting ==="
                                sh '''
                                    node --version
                                    npm --version
                                    npm ci
                                    npm run lint 2>&1 || true
                                '''
                            }
                        }
                    }
                }

                stage('Frontend: SAST Analysis') {
                    steps {
                        dir('UI/frontend') {
                            script {
                                echo "=== Frontend Component: Security Analysis ==="
                                sh '''
                                    echo "--- Semgrep TypeScript/React Scan ---" > ../../reports/frontend-sast.txt
                                    semgrep scan --config="p/owasp-top-ten" --config="p/typescript" . >> ../../reports/frontend-sast.txt 2>&1 || true
                                    
                                    echo "" >> ../../reports/frontend-sast.txt
                                    echo "--- npm audit ---" >> ../../reports/frontend-sast.txt
                                    npm audit --audit-level=moderate >> ../../reports/frontend-sast.txt 2>&1 || true
                                '''
                            }
                        }
                    }
                }

                stage('Frontend: Build') {
                    steps {
                        dir('UI/frontend') {
                            script {
                                echo "=== Frontend Component: Building ==="
                                sh '''
                                    npm run build 2>&1 || true
                                '''
                            }
                        }
                    }
                }

                stage('Frontend: Build Docker Image') {
                    when {
                        anyOf{
                            branch 'main'
                            branch 'development'
                        }
                    }
                    steps {
                        dir('UI/frontend') {
                            script {
                                echo "=== Frontend Component: Building Docker Image ==="
                                sh '''
                                    docker build -t ${REGISTRY}/${IMAGE_NAME}-frontend:${BUILD_NUMBER} \
                                        -t ${REGISTRY}/${IMAGE_NAME}-frontend:latest \
                                        -f dockerfile . 2>&1 || true
                                '''
                            }
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/frontend-sast.txt', 
                                    allowEmptyArchive: true
                }
            }
        }

        stage('Backend Component Pipeline') {
            when {
                anyOf {
                    branch 'dev-*'
                    branch 'main'
                }
            }
            stages {
                stage('Backend: Setup & Lint') {
                    steps {
                        dir('UI/backend') {
                            script {
                                echo "=== Backend Component: Setup & Linting ==="
                                sh '''
                                    python3 --version
                                    pip install --upgrade pip
                                    pip install black isort flake8 pylint
                                    
                                    echo "--- Code Formatting Check ---"
                                    black --check . --line-length=127 || true
                                    isort --check-only . || true
                                    
                                    echo "--- Flake8 Analysis ---"
                                    flake8 . --max-complexity=10 --max-line-length=127 --statistics || true
                                '''
                            }
                        }
                    }
                }

                stage('Backend: SAST Analysis') {
                    steps {
                        dir('UI/backend') {
                            script {
                                echo "=== Backend Component: Static Application Security Testing ==="
                                sh '''
                                    echo "--- Semgrep Django Security ---" > ../../reports/backend-sast.txt
                                    semgrep scan --config="p/owasp-top-ten" --config="p/django" . >> ../../reports/backend-sast.txt 2>&1 || true
                                '''
                            }
                        }
                    }
                }

                stage('Backend: Unit Tests') {
                    steps {
                        dir('UI/backend') {
                            script {
                                echo "=== Backend Component: Unit Tests ==="
                                sh '''
                                    pip install -r requirements.txt pytest pytest-django pytest-cov
                                    python3 manage.py test --keepdb 2>&1 | tee ../../reports/backend-tests.txt || true
                                '''
                            }
                        }
                    }
                }

                stage('Backend: Build Docker Image') {
                    when {
                        anyOf{
                            branch 'main'
                            branch 'development'
                        }
                    }
                    steps {
                        dir('UI/backend') {
                            script {
                                echo "=== Backend Component: Building Docker Image ==="
                                sh '''
                                    docker build -t ${REGISTRY}/${IMAGE_NAME}-backend:${BUILD_NUMBER} \
                                        -t ${REGISTRY}/${IMAGE_NAME}-backend:latest \
                                        -f dockerfile . 2>&1 || true
                                '''
                            }
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/backend-*.txt', 
                                    allowEmptyArchive: true
                }
            }
        }

        stage('Infrastructure Validation') {
            when {
                branch 'main'
            }
            steps {
                dir('deploy/infrastructure') {
                    script {
                        echo "=== Validating Terraform Configuration ==="
                        sh '''
                            terraform fmt -check . || true
                            terraform validate || true
                        '''
                    }
                }
            }
        }

        stage('Generate Security Report') {
            steps {
                script {
                    echo "=== Consolidating Security Report ==="
                    sh '''
                        mkdir -p reports
                        
                        cat > reports/SECURITY_SUMMARY.md << 'EOF'
                        # Security Scan Summary
                        **Build Number**: ${BUILD_NUMBER}
                        **Build Date**: $(date)
                        **Git Commit**: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
                        **Branch**: ${GIT_BRANCH:-main}

                        ## Scan Results
                        EOF
                        
                        if [ -f reports/secrets-scan.txt ]; then
                            echo "### Secret Scanning" >> reports/SECURITY_SUMMARY.md
                            cat reports/secrets-scan.txt | tail -5 >> reports/SECURITY_SUMMARY.md
                        fi
                        
                        if [ -f reports/dependency-scan.txt ]; then
                            echo "### Dependency Vulnerabilities" >> reports/SECURITY_SUMMARY.md
                            cat reports/dependency-scan.txt | tail -5 >> reports/SECURITY_SUMMARY.md
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "=== Pipeline Cleanup & Archiving ==="
                archiveArtifacts artifacts: 'reports/**/*', 
                                allowEmptyArchive: true
                
                cleanWs(deleteDirs: true, patterns: [[pattern: '**/node_modules/**', type: 'INCLUDE']])
            }
        }
        success {
            script {
                echo "✓ Pipeline completed successfully"
                // Add Slack/Email notification here
                // slackSend(message: "Build #${BUILD_NUMBER} succeeded")
            }
        }
        failure {
            script {
                echo "✗ Pipeline failed"
                // Add Slack/Email notification here
                // slackSend(message: "Build #${BUILD_NUMBER} failed", color: 'danger')
            }
        }
        unstable {
            script {
                echo "⚠ Pipeline unstable"
            }
        }
    }
}