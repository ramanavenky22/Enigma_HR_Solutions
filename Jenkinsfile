pipeline {
  agent any

  tools {
    nodejs 'node-18'  // Must match the Node.js tool name configured in Jenkins
  }

  environment {
    BACKEND_DIR = 'backend'
    FRONTEND_DIR = 'frontend'
    NODE_ENV = 'production'
  }

  options {
    timeout(time: 10, unit: 'MINUTES') // Prevent stuck builds
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
          echo '🏗️ Building frontend using local Angular CLI...'
          sh './node_modules/.bin/ng build'
        }
      }
    }

    stage('Test (Optional)') {
      steps {
        echo '🧪 No tests configured yet — you can add backend/frontend tests here.'
      }
    }

    stage('Deploy (Optional)') {
      steps {
        echo '🚀 Add deployment logic here (S3, EC2, Render, etc.)'
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
