pipeline {
  agent any

  tools {
    nodejs 'node-18' // Name must match your Jenkins NodeJS installation
  }

  environment {
    // You can define environment variables here if needed
    NODE_ENV = 'production'
  }

  options {
    timeout(time: 10, unit: 'MINUTES') // Avoid infinite builds
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
        dir('backend') {
          echo '📦 Installing backend dependencies...'
          sh 'npm install'
        }
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        dir('frontend') {
          echo '📦 Installing frontend dependencies...'
          sh 'npm install'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '🏗️ Building frontend...'
          sh 'npm run build'
        }
      }
    }

    stage('Test (Optional)') {
      steps {
        echo '🧪 Add test scripts here if needed.'
        // sh 'npm test'
      }
    }

    stage('Deploy (Optional)') {
      steps {
        echo '🚀 Add deployment steps here (e.g., S3, EC2, Render, etc.)'
      }
    }
  }

  post {
    success {
      echo '✅ Build completed successfully.'
    }
    failure {
      echo '❌ Build failed.'
    }
  }
}
