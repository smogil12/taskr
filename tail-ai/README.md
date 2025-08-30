# Tail.AI 🚀

A modern, AI-powered time management and project tracking application built with Next.js, Node.js, and TypeScript.

## ✨ Features

- **⏱️ Smart Time Tracking**: AI-powered time estimation and tracking
- **📊 Project Management**: Comprehensive project and task management
- **👥 Team Collaboration**: Multi-user teams with role-based access control
- **🔐 Secure Authentication**: NextAuth.js with 2FA and OAuth support
- **📱 Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **🔌 Integrations**: Slack, GitHub, Jira, and more
- **📈 Analytics**: Advanced reporting and insights
- **🚀 Scalable Architecture**: Microservices with clean separation of concerns

## 🏗️ Architecture

```
tail-ai/
├── frontend/          # Next.js 14 frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types, schemas, and constants
├── infrastructure/    # Docker and deployment configuration
└── docs/             # Project documentation
```

### Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, NextAuth.js
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Redis caching
- **Authentication**: NextAuth.js with JWT and OAuth
- **Validation**: Zod schemas for runtime validation
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tail-ai.git
cd tail-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Infrastructure

```bash
npm run setup:db
```

### 5. Start Development Servers

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Mailhog**: http://localhost:8025

## 📁 Project Structure

### Frontend (`/frontend`)

```
src/
├── app/              # Next.js 13+ app directory
├── components/       # Reusable UI components
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
├── types/           # Frontend-specific types
└── styles/          # Global styles and Tailwind config
```

### Backend (`/backend`)

```
src/
├── controllers/      # Request handlers
├── services/        # Business logic
├── models/          # Data models and database schemas
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── utils/           # Utility functions
└── config/          # Configuration files
```

### Shared (`/shared`)

```
src/
├── types/           # TypeScript interfaces
├── schemas/         # Zod validation schemas
├── constants/       # Application constants
└── utils/           # Shared utility functions
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tail_ai_dev

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
RESEND_API_KEY=your-resend-api-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
```

### Database Setup

The application uses PostgreSQL with automatic migrations:

```bash
# Start database
npm run setup:db

# Run migrations (automatic on startup)
npm run dev:backend
```

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Stop services
npm run docker:down
```

### Environment-Specific Deployments

The application supports multiple environments:

- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 📚 API Documentation

### REST API

The backend provides a comprehensive REST API:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Projects**: `/api/projects/*`
- **Tasks**: `/api/tasks/*`
- **Time Entries**: `/api/time-entries/*`
- **Organizations**: `/api/organizations/*`

### GraphQL (Optional)

GraphQL endpoint available at `/api/graphql` with GraphiQL interface.

## 🔐 Authentication & Security

### Features

- **Multi-factor Authentication (2FA)**
- **OAuth Providers**: Google, GitHub, Microsoft
- **Session Management**
- **Role-based Access Control (RBAC)**
- **API Rate Limiting**
- **CORS Protection**
- **Helmet Security Headers**

### User Roles

- **Owner**: Full system access
- **Admin**: Organization management
- **Manager**: Project and team management
- **Member**: Standard user access
- **Viewer**: Read-only access

## 🎨 UI/UX Features

### Design System

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching
- **Accessibility**: WCAG 2.1 AA compliant
- **Internationalization**: Multi-language support
- **Customizable**: User preferences and settings

### Components

- **Dashboard**: Overview and analytics
- **Time Tracker**: Start/stop timer with AI suggestions
- **Project Board**: Kanban-style project management
- **Calendar View**: Time entry visualization
- **Reports**: Customizable reports and exports

## 🤖 AI Features

### Time Estimation

- **Smart Suggestions**: AI-powered time estimates
- **Pattern Recognition**: Learn from user behavior
- **Project Templates**: AI-generated project structures
- **Task Breakdown**: Automatic task decomposition

### Analytics

- **Productivity Insights**: AI-driven productivity analysis
- **Trend Analysis**: Identify patterns and improvements
- **Predictive Analytics**: Forecast project completion
- **Resource Optimization**: AI-suggested resource allocation

## 🔌 Integrations

### Supported Services

- **Communication**: Slack, Discord, Microsoft Teams
- **Development**: GitHub, GitLab, Bitbucket
- **Project Management**: Jira, Asana, Trello
- **Calendar**: Google Calendar, Outlook
- **Video Conferencing**: Zoom, Google Meet

### Webhooks

- **Real-time Updates**: Instant notifications
- **Custom Endpoints**: User-defined webhooks
- **Event Filtering**: Selective event delivery
- **Retry Logic**: Reliable message delivery

## 📊 Monitoring & Analytics

### Application Metrics

- **Performance**: Response times and throughput
- **Errors**: Error rates and debugging
- **Usage**: Feature adoption and user behavior
- **Business**: Revenue, retention, and growth

### Health Checks

- **Database**: Connection and query performance
- **External Services**: API availability
- **Infrastructure**: Resource utilization
- **Custom Metrics**: Business-specific KPIs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code style
- **Prettier**: Automatic formatting
- **Tests**: Maintain test coverage
- **Documentation**: Update docs as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: [docs.tail.ai](https://docs.tail.ai)
- **Issues**: [GitHub Issues](https://github.com/yourusername/tail-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tail-ai/discussions)
- **Email**: support@tail.ai

### Community

- **Discord**: [Join our community](https://discord.gg/tail-ai)
- **Twitter**: [@tail_ai](https://twitter.com/tail_ai)
- **Blog**: [blog.tail.ai](https://blog.tail.ai)

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment tools
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For all the amazing libraries

---

**Built with ❤️ by the Tail.AI Team**

*Modern time management for modern teams*
