# Enigma HR Solutions

A modern Human Resources Management System built with Angular and Node.js.

## 🚀 Features

- Employee Management
- Leave Management
- Attendance Tracking
- Performance Reviews
- Document Management
- Role-based Access Control

## 🛠️ Tech Stack

### Frontend
- Angular 15+
- TypeScript
- Angular Material
- SCSS
- RxJS

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v8.0 or higher)
- Angular CLI (v15 or higher)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ramanavenky22/Enigma_HR_Solutions.git
cd Enigma_HR_Solutions
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=enigma_hr
JWT_SECRET=your_jwt_secret
PORT=3000
```

Run database migrations:
```bash
npm run migrate
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## 🏗️ Project Structure

```
Enigma_HR_Solutions/
├── frontend/                # Angular frontend application
│   ├── src/
│   │   ├── app/           # Application components
│   │   ├── assets/        # Static assets
│   │   └── environments/  # Environment configurations
│   └── ...
├── backend/                # Node.js backend application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── migrations/       # Database migrations
│   ├── routes/          # API routes
│   └── ...
└── Jenkinsfile           # CI/CD pipeline configuration
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
ng test
```

### Code Style
The project uses ESLint and Prettier for code formatting. Run the following commands to check code style:

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 📦 Deployment

The project includes a Jenkins pipeline for CI/CD. The pipeline:
1. Runs tests
2. Builds the application
3. Deploys to the staging/production environment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Ramanavenky22 - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries