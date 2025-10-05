# Experiment Management System

A full-stack web application for managing and tracking research experiments. This system provides a comprehensive platform for researchers to organize, monitor, and analyze their experimental work with features like experiment tracking, data visualization, file attachments, and user authentication.

## 🚀 Features

- **User Authentication**: Secure sign-up and sign-in with JWT tokens
- **Experiment Management**: Create, edit, view, and track experiments
- **Status Tracking**: Monitor experiment progress (planning, in-progress, completed, on-hold, cancelled)
- **Data Visualization**: Interactive charts and insights dashboard
- **File Attachments**: Upload and manage experiment-related files
- **Search & Filter**: Find experiments by title, description, or research focus
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Real-time Updates**: Live data synchronization between frontend and backend

## 🏗️ Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React 19 with Vite, Tailwind CSS, and Chart.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with Passport.js
- **State Management**: Zustand for client-side state
- **File Storage**: AWS S3 integration (optional)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **MongoDB** (version 5 or higher)
- **Git** (for cloning the repository)

### Optional Prerequisites

- **AWS Account** (for S3 file storage)
- **Sentry Account** (for error tracking)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd test-INFO
```

### 2. Environment Configuration

Create environment files for both frontend and backend:

```bash
# Copy the example environment file
cp env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Application Environment
NODE_ENV=development
APP_URL=http://localhost:5173

# Database Configuration
MONGO_URL=mongodb://localhost:27017/experiment-management

# JWT Secret (Generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AWS S3 Configuration (Optional - for file uploads)
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-aws-access-key-id
S3_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_BUCKET_NAME=your-s3-bucket-name

# Sentry Configuration (Optional - for error tracking)
SENTRY_URL=your-sentry-dsn-url
```

### 3. Database Setup

Start MongoDB on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

Or use MongoDB Atlas (cloud database):

- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string and update `MONGO_URL` in `.env`

### 4. Backend Setup

```bash
# Navigate to the API directory
cd api

# Install dependencies
npm install

# Start the development server
npm run dev
```

The API server will start on `http://localhost:3000`

### 5. Frontend Setup

Open a new terminal and navigate to the app directory:

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 🎯 Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
2. **Start the Backend**: `cd api && npm run dev`
3. **Start the Frontend**: `cd app && npm run dev`
4. **Access the Application**: Open `http://localhost:5173` in your browser

### Production Mode

1. **Build the Frontend**:

   ```bash
   cd app
   npm run build
   ```

2. **Start the Backend**:

   ```bash
   cd api
   npm start
   ```

3. **Serve the Frontend**: Use a web server like nginx or serve the `app/dist` folder

## 📁 Project Structure

```
test-INFO/
├── api/                    # Backend API
│   ├── config.js          # Configuration settings
│   ├── index.js           # Main server file
│   ├── models/            # Database models
│   │   ├── Experiment.js  # Experiment schema
│   │   └── User.js        # User schema
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── experiments.js # Experiment routes
│   │   └── file.js        # File upload routes
│   ├── services/          # Business logic
│   │   └── passport.js    # Passport configuration
│   └── scripts/           # Database seeding scripts
├── app/                   # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── docker-compose.yml     # Docker configuration
├── env.example           # Environment variables template
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/signin_token` - Token validation

### Experiments

- `GET /experiments` - Get all experiments
- `POST /experiments` - Create new experiment
- `GET /experiments/:id` - Get specific experiment
- `PUT /experiments/:id` - Update experiment
- `DELETE /experiments/:id` - Delete experiment

### Files

- `POST /file/upload` - Upload file
- `GET /file/:filename` - Download file

## 🧪 Development

### Available Scripts

**Backend (API)**:

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

**Frontend (App)**:

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

```

## 🔒 Security Considerations

- Change default JWT secret in production
- Use strong passwords for MongoDB
- Configure proper CORS settings
- Set up SSL/TLS certificates for production
- Regular security updates for dependencies
- Use environment variables for sensitive data

---

**Note**: For Docker-based deployment, see [DOCKER_README.md](./DOCKER_README.md)
```
