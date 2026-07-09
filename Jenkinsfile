/*
 * Blastradius CI/CD pipeline.
 *
 * Notable: stage "Score this deploy" calls Blastradius's own POST /api/deploys/score
 * with the metadata of the build currently running — the tool deliberately dogfoods
 * its own risk scoring. If the returned score exceeds RISK_THRESHOLD the pipeline
 * pauses for manual approval; otherwise it deploys to Kubernetes automatically.
 */
pipeline {
    agent any

    environment {
        // Compose service DNS name — reachable from a Jenkins agent joined to
        // the same docker-compose network (see jenkins/README.md).
        BLASTRADIUS_URL = 'http://backend:8080'
        // Deploys scoring above this pause for human approval.
        RISK_THRESHOLD  = '60'
        SERVICE_NAME    = 'blastradius'
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        // kind cluster name images get loaded into before kubectl references them.
        KIND_CLUSTER    = 'blastradius'
    }

    stages {
        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn -B -q package -DskipTests'
                }
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Unit test') {
            steps {
                dir('backend') {
                    sh 'mvn -B test'
                }
                dir('frontend') {
                    sh 'npm test'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Score this deploy') {
            steps {
                script {
                    // Derive real diff metadata for THIS build from git.
                    def range = sh(
                        script: "git rev-parse HEAD~1 >/dev/null 2>&1 && echo 'HEAD~1..HEAD' || echo ''",
                        returnStdout: true).trim()
                    def diffLines = sh(
                        script: "git diff --shortstat ${range} | awk '{print \$4+\$6}'",
                        returnStdout: true).trim() ?: '0'
                    def testLines = sh(
                        script: "git diff --numstat ${range} -- '*test*' '*__tests__*' | awk '{s+=\$1+\$2} END {print s+0}'",
                        returnStdout: true).trim()
                    def prodLines = ((diffLines as int) - (testLines as int)).toString()
                    def changedPaths = sh(
                        script: "git diff --name-only ${range} | head -50",
                        returnStdout: true).trim().split('\n').findAll { it }

                    // writeJSON (Pipeline Utility Steps) instead of groovy.json.JsonOutput —
                    // the latter is a raw static call the pipeline sandbox rejects by default.
                    writeJSON file: 'score-request.json', json: [
                        serviceName     : env.SERVICE_NAME,
                        diffLinesChanged: diffLines as int,
                        prodLinesChanged: Math.max(prodLines as int, 0),
                        testLinesChanged: testLines as int,
                        changedPaths    : changedPaths,
                    ]

                    def response = sh(
                        script: "curl -sf -X POST ${env.BLASTRADIUS_URL}/api/deploys/score " +
                                "-H 'Content-Type: application/json' -d @score-request.json",
                        returnStdout: true).trim()
                    def result = readJSON text: response

                    env.RISK_SCORE = result.riskScore.toString()
                    env.DEPLOY_ID  = result.id.toString()
                    echo "Blastradius scored this deploy ${env.RISK_SCORE}/100 (${result.riskLevel})"
                    result.breakdown.each { f ->
                        echo "  ${f.triggered ? '+' + f.points : ' 0'} pts — ${f.detail}"
                    }
                }
            }
        }

        stage('Risk gate') {
            when {
                expression { (env.RISK_SCORE as int) > (env.RISK_THRESHOLD as int) }
            }
            steps {
                input message: "Risk score ${env.RISK_SCORE} exceeds threshold ${env.RISK_THRESHOLD}. " +
                               "Review deploy ${env.DEPLOY_ID} in the dashboard and approve to continue.",
                      ok: 'Deploy anyway'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh "docker build -t blastradius-backend:${IMAGE_TAG} backend/"
                sh "docker build -t blastradius-frontend:${IMAGE_TAG} frontend/"
                // Images are local-only (no registry) — kind's node containerd can't
                // pull them, so they must be loaded into the cluster explicitly.
                // (minikube's equivalent is `eval $(minikube docker-env)` before build,
                // which needs no separate load step.)
                sh "kind load docker-image blastradius-backend:${IMAGE_TAG} --name ${KIND_CLUSTER}"
                sh "kind load docker-image blastradius-frontend:${IMAGE_TAG} --name ${KIND_CLUSTER}"
                sh 'kubectl apply -f k8s/'
                sh "kubectl set image deployment/blastradius-backend backend=blastradius-backend:${IMAGE_TAG}"
                sh "kubectl set image deployment/blastradius-frontend frontend=blastradius-frontend:${IMAGE_TAG}"
                sh 'kubectl rollout status deployment/blastradius-backend --timeout=180s'
                sh 'kubectl rollout status deployment/blastradius-frontend --timeout=180s'
            }
        }
    }

    post {
        success {
            // Close the feedback loop: mark the scored deploy as shipped. Guarded
            // because a failure before the Score stage means no deploy was ever
            // created (DEPLOY_ID unset) — nothing to report an outcome against.
            script {
                if (env.DEPLOY_ID) {
                    sh "curl -sf -X POST ${env.BLASTRADIUS_URL}/api/deploys/${env.DEPLOY_ID}/outcome " +
                       "-H 'Content-Type: application/json' -d '{\"status\":\"SHIPPED\"}' || true"
                }
            }
        }
        failure {
            script {
                if (env.DEPLOY_ID) {
                    sh "curl -sf -X POST ${env.BLASTRADIUS_URL}/api/deploys/${env.DEPLOY_ID}/outcome " +
                       "-H 'Content-Type: application/json' -d '{\"status\":\"ROLLED_BACK\"}' || true"
                }
            }
        }
    }
}
