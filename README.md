# CareerSense

CareerSense is an AI-powered career guidance platform that helps users optimize their professional development through CV analysis, personalized career path suggestions, and interview preparation.

> **Migration Note**: This project has been restructured from a previous version to follow a clean, modular architecture. The new structure aims to improve clarity, maintainability, and scalability while following modern development practices.

## Project Structure

This project follows a clean, modular architecture with strict separation between frontend and backend:

```
career-sense-clean/
├── backend/               # Node.js Express server
│   ├── index.js           # Main server file
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   └── uploads/           # File uploads
│
└── frontend/              # React TypeScript application
    ├── public/            # Static assets
    │   └── assets/        # Images, icons, fonts
    └── src/
        ├── api/           # API communication layer
        ├── assets/        # Styles and images
        ├── components/    # Reusable UI components
        │   ├── common/    # Shared components
        │   ├── layout/    # Layout components
        │   └── ui/        # UI components
        ├── features/      # Feature modules
        │   ├── home/
        │   ├── dashboard/
        │   ├── cv-upload/
        │   ├── career-paths/
        │   └── mock-interviews/
        └── router/        # Application routing
```

## Architecture Overview

### Backend Architecture

The backend follows a modular structure with clear separation of concerns:

- **Routes**: Define API endpoints and connect them to controllers
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and interact with external APIs
- **Middleware**: Process requests before they reach route handlers
- **Models**: Define data structures (when using a database)

The backend uses Express.js and integrates with OpenAI's GPT-4o-mini model for AI-powered career insights and CV analysis.

### Frontend Architecture

The frontend is organized using a feature-based approach:

- **Components**: Reusable UI elements organized by type (common, layout, UI)
- **Features**: Feature-specific components and logic grouped together
- **API Layer**: Centralized communication with the backend
- **Router**: Application routing with lazy-loaded components
- **Assets**: Styles and images

The frontend uses React with TypeScript and Tailwind CSS for styling, following a utility-first approach.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (for backend AI functionality)

### Environment Setup

1. **Backend Environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. **Frontend Environment** (optional):
   ```bash
   cd frontend
   cp .env.example .env
   ```

### Installation

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

You'll need two terminal windows to run both the frontend and backend simultaneously.

1. **Start the Backend**:
   ```bash
   cd backend
   npm start
   ```
   The backend will run on http://localhost:5001

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

### Advanced: Running Both Simultaneously (Optional)

If you want to run both frontend and backend with a single command, you can install `concurrently` in the root directory:

```bash
npm install --save-dev concurrently
```

Then add this script to the root `package.json`:

```json
"scripts": {
  "dev": "concurrently \"cd backend && npm start\" \"cd frontend && npm start\""
}
```

And run both with:

```bash
npm run dev
```

## Features

- **CV Analysis**: Upload your CV for AI-powered analysis of strengths and areas for improvement
- **Career Path Suggestions**: Get personalized recommendations based on your skills and experience
- **STAR-based Interview Stories**: Generate structured interview responses from your experiences
- **Mock Interview Simulation**: Practice with AI-generated scenarios and receive feedback
- **Modern UI**: Clean, responsive interface with smooth animations

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Ant Design for UI components
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express
- OpenAI API (gpt-4o-mini model) for AI capabilities
- Multer for file uploads
- PDF-Parse and Mammoth for document parsing
- Compression and caching middleware for performance

## Performance Optimizations

The application includes several performance optimizations:

- **Backend**: Compression middleware, response caching, and rate limiting
- **Frontend**: Component memoization, API response caching, and lazy loading
- **Error Handling**: Comprehensive error boundaries and centralized error handling

## Documentation

- **API Documentation**: See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Component Documentation**: See [docs/COMPONENT_DOCUMENTATION.md](docs/COMPONENT_DOCUMENTATION.md)
- **Contributing Guidelines**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed information on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
