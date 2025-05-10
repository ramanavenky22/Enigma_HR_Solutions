pipeline {
  agent any

  tools {
    nodejs 'node-18' // Make sure this matches your configured NodeJS tool in Jenkins
  }

  environment {
    BACKEND_DIR = 'backend'
    FRONTEND_DIR = 'frontend'
    NODE_ENV = 'production'
  }

  options {
    timeout(time: 10, unit: 'MINUTES') // Prevents long-running stuck builds
  }

  stages {
    stage('Checkout') {
      steps {
        echo '📦 Cloning source code...'
        checkout scm
      }
    }

    stage('Install Backend Dependencies') {
      steps {
        dir("${env.BACKEND_DIR}") {
          echo '📦 Installing backend dependencies...'
          sh 'npm install'
        }
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          echo '📦 Installing frontend dependencies...'
          sh 'npm install'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          echo '🏗️ Building frontend using local Angular CLI (via npx)...'
          sh 'npx ng build'
        }
      }
    }

    stage('Test (Optional)') {
      steps {
        echo '🧪 Add test steps here if needed (backend/frontend).'
      }
    }

    stage('Deploy (Optional)') {
      steps {
        echo '🚀 Add deployment logic here (to S3, EC2, etc.).'
      }
    }
  }

  post {
    success {
      echo '✅ Build completed successfully!'
    }
    failure {
      echo '❌ Build failed.'
    }
  }
}
