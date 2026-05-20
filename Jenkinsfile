// Corrected Groovy Global Definitions
def BRANCH = ['development', 'main', 'feature']
def MICROSERVICES = [
    [name: 'auth-serviced', path: '/auth', id: 'x1'],
    [name: 'AI-serviced', path: '/AI', id: 'x2'],
    [name: 'UI-serviced', path: '/UI', id: 'x3']
]

pipeline {
    agent {
        label 'linux'
    }
    environment {
        VERSION = '0.5.87'
        // We use the env context to cleanly handle dynamic variable propagation across stages
        DYNAMIC_VAR = "" 
    }
    stages {
        stage('test') {
            when {
                allOf {
                    anyOf {
                        branch 'development'
                        branch 'main' 
                        branch 'feature-*'
                    }
                    expression { 
                        return fileExists('Dockerfile') && 
                               fileExists('test/requirements.txt')
                    }
                    changeset 'test/dataset/'
                }
            }
            steps {
                sh '''
                    echo "This will run only on matched development, main, or feature branches"
                '''
                // Execute your custom global function safely
                FirstFunction(BRANCH[1], 5)
                
                script {
                    // Update environment variable cleanly
                    env.DYNAMIC_VAR = "5.2.65"
                }
            }
            post {
                always {
                    cleanWs() // Fixed casing
                }
                failure {
                    echo "The pipeline completed with failure"
                }
                success {
                    echo "The pipeline completed with success"
                }
                unstable {
                    echo "Pipeline state is unstable"
                }
            }
        }
        
        stage('build') {
            when {
                branch 'main'
            }
            matrix {
                axes {
                    axis {
                        name 'X'
                        values 'x1', 'x2', 'x3', 'x4'
                    }
                    axis {
                        name 'Y'
                        values 'y1', 'y2', 'y3', 'y4'
                    }
                }
                excludes {
                    exclude {
                        axis { name 'X'; values 'x1', 'x2', 'x3' }
                        axis { name 'Y'; values 'y1' }
                    }
                }
                stages {
                    stage('Matrix Execution') {
                        steps {
                            echo "Dynamic Var from previous stage: ${env.DYNAMIC_VAR}"
                            echo "Current Matrix Axis Coordinates: ${X}-${Y}"
                            
                            script {
                                // Encapsulated Groovy parsing safely inside script block
                                def microservice = MICROSERVICES.find { it.id == X }
                                if (microservice) {
                                    echo "Targeting Microservice: ${microservice.name} at path ${microservice.path}"
                                } else {
                                    echo "No matching microservice configuration mapped for ID: ${X}"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Crudation-Test'){
            environment{
                BACKEND_PORT = credentials(BACKEND_PORT)
            }
            steps{
                echo "${BACKEND_PORT}"
            }
        }
    }
}

// Global functions must remain outside the pipeline block
def FirstFunction(String branchName, int n) {
    echo "Executing FirstFunction on branch: ${branchName} with parameter: ${n}"
}