## 🐳 Docker Deployment

This application is containerized and ready for easy deployment using Docker and Docker Compose.

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd test-INFO
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

3. **Start the application**

   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost:3000
   - MongoDB: localhost:27017

### Environment Configuration

Copy `env.example` to `.env` and configure the following variables:

```bash
# Application Environment
NODE_ENV=production
APP_URL=http://localhost:5173

# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGO_DATABASE=experiment-management

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

### Docker Commands

#### Start the application

```bash
docker-compose up -d
```

#### Stop the application

```bash
docker-compose down
```

#### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f app
docker-compose logs -f mongodb
```

#### Rebuild and restart

```bash
docker-compose up -d --build
```

#### Remove everything (including volumes)

```bash
docker-compose down -v
```

### Service Health Checks

All services include health checks:

- **API**: `http://localhost:3000/health`
- **Frontend**: `http://localhost/health`
- **MongoDB**: Internal health check

### Development Mode

For development with hot reloading:

1. **API Development**

   ```bash
   cd api
   npm install
   npm run dev
   ```

2. **Frontend Development**

   ```bash
   cd app
   npm install
   npm run dev
   ```

3. **MongoDB only**
   ```bash
   docker-compose up -d mongodb
   ```

### Production Deployment

For production deployment:

1. **Set production environment variables**

   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   MONGO_ROOT_PASSWORD=<strong-password>
   ```

2. **Use production Docker Compose**

   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Set up reverse proxy (recommended)**
   - Use nginx or traefik for SSL termination
   - Configure proper domain names
   - Set up monitoring and logging

### Architecture

The application consists of three main services:

- **Frontend (app)**: React application served by nginx
- **Backend (api)**: Node.js/Express API server
- **Database (mongodb)**: MongoDB database with persistent storage

### Troubleshooting

#### Common Issues

1. **Port conflicts**

   - Ensure ports 80, 3000, and 27017 are available
   - Modify ports in `docker-compose.yml` if needed

2. **Database connection issues**

   - Check MongoDB health: `docker-compose logs mongodb`
   - Verify environment variables are set correctly

3. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

#### Logs and Debugging

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 -f

# Access container shell
docker-compose exec api sh
docker-compose exec app sh
```

### Security Considerations

- Change default passwords in production
- Use strong JWT secrets
- Configure proper CORS settings
- Set up SSL/TLS certificates
- Regular security updates for base images
- Use Docker secrets for sensitive data in production

### Monitoring

The application includes health check endpoints for monitoring:

- API health: `GET /health`
- Frontend health: `GET /health`

Consider integrating with monitoring solutions like:

- Prometheus + Grafana
- DataDog
- New Relic
