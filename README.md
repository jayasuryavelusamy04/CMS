# Campus Management System (CMS)

A comprehensive campus management system designed for schools, colleges, and educational institutes. Built with modern technologies and featuring an offline-first approach for reliable operation in varying network conditions.

## Core Features

### 1. Academic Management
- Course and subject management
- Class and section organization
- Timetable scheduling and management
- Teacher schedule management

### 2. Student Management
- Student profiles and records
- Admission management
- Guardian information
- Document management

### 3. Attendance System
- QR Code-based attendance marking
- Offline support with automatic sync
- Real-time attendance tracking
- Attendance statistics and reporting
- Mobile-friendly attendance marking

### 4. Fee Management
- Fee structure configuration
- Fee collection tracking
- Payment history
- Due fee notifications
- Receipt generation

### 5. Staff Management
- Teacher profiles
- Staff attendance
- Role and permission management
- Schedule management

### 6. Parent Portal
- Student progress tracking
- Attendance monitoring
- Fee payment status
- Communication with teachers

### 7. Examination System
- Exam scheduling
- Results management
- Performance analytics
- Report card generation

### 8. Reports & Analytics
- Attendance reports
- Fee collection reports
- Academic performance analytics
- Staff performance tracking

## Technical Features

- Offline-first architecture
- Real-time synchronization
- Multi-device support
- Role-based access control
- Secure authentication
- Responsive design
- Data export capabilities

## Tech Stack

### Backend (Python)
- FastAPI framework
- PostgreSQL database
- SQLAlchemy ORM
- Alembic migrations
- JWT authentication
- Pydantic validation

### Frontend (TypeScript)
- React 18
- Redux Toolkit
- Ant Design components
- IndexedDB for offline storage
- TypeScript
- QR Code integration

### Infrastructure
- Docker containerization
- Nginx reverse proxy
- Automated deployment
- Database backups
- API documentation

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL (for local development)

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd campus-management-system
   ```

2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/client/.env.example frontend/client/.env
   ```

3. Make the development script executable:
   ```bash
   chmod +x dev.sh
   ```

4. Start the application:
   ```bash
   ./dev.sh build    # First time setup
   ./dev.sh start    # Start all services
   ```

Access the application at:
- Web Application: http://localhost:5173
- API Documentation: http://localhost:8000/docs
- Admin Dashboard: http://localhost:5173/admin

## Development

### Available Commands
```bash
./dev.sh <command>
```
- `start`: Start all services
- `stop`: Stop all services
- `restart`: Restart all services
- `build`: Rebuild all services
- `logs`: Show logs from all services
- `backend`: Show backend logs
- `frontend`: Show frontend logs
- `db`: Show database logs
- `test`: Run tests
- `migrate`: Run database migrations
- `shell`: Open backend shell

### Directory Structure
```
.
├── backend/                 # Python FastAPI backend
│   ├── src/
│   │   ├── api/           # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── crud/         # Database operations
│   │   ├── models/       # Database models
│   │   └── schemas/      # Data validation schemas
│   └── tests/            # Backend tests
├── frontend/
│   └── client/           # React frontend
│       ├── src/
│       │   ├── features/  # Feature modules
│       │   │   ├── admission/
│       │   │   ├── attendance/
│       │   │   ├── fees/
│       │   │   └── ...
│       │   ├── components/# Shared components
│       │   ├── services/  # API services
│       │   └── store/    # Redux store
│       └── tests/        # Frontend tests
└── docker/               # Docker configurations
```

## Configuration

### Backend Environment Variables
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=campus_cms
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Campus CMS
VITE_OFFLINE_STORAGE_KEY=cms_offline_data
VITE_SYNC_INTERVAL=60000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Backend Tests
```bash
./dev.sh test backend
```

### Frontend Tests
```bash
./dev.sh test frontend
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@campuscms.com or create an issue in the repository.
