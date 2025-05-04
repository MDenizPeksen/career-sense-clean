# Contributing to CareerSense

Thank you for considering contributing to CareerSense! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Project Structure

Please follow our established project structure as outlined in the README.md. This project follows a clean, modular architecture with strict separation between frontend and backend:

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
    └── src/
        ├── api/           # API communication layer
        ├── assets/        # Styles and images
        ├── components/    # Reusable UI components
        │   ├── common/    # Shared components
        │   ├── layout/    # Layout components
        │   └── ui/        # UI components
        ├── features/      # Feature modules
        └── router/        # Application routing
```

## Development Guidelines

### Backend (Node.js/Express)

1. **Modular Structure**: Follow the modular backend structure with routes, controllers, and services.
2. **Error Handling**: Use the centralized error handling middleware.
3. **Environment Variables**: Store configuration in environment variables, documented in `.env.example`.
4. **API Documentation**: Update the API documentation in `docs/API_DOCUMENTATION.md` when adding or modifying endpoints.

### Frontend (React/TypeScript)

1. **Feature-Based Organization**: Group components by feature in the `features/` directory.
2. **Component Documentation**: Document components in `docs/COMPONENT_DOCUMENTATION.md`.
3. **Styling**: Use Tailwind CSS for styling. Avoid custom CSS when possible.
4. **Error Boundaries**: Implement error boundaries for feature components.
5. **Performance**: Use memoization and other performance optimizations where appropriate.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure your code follows the established code style.
4. Update the documentation if necessary.
5. Issue the pull request.

## Commit Message Guidelines

We follow conventional commits for our commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Changes to the build process or auxiliary tools

## Getting Help

If you need help with anything, please open an issue or reach out to the maintainers.

Thank you for contributing to CareerSense!
