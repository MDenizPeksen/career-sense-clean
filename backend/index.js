require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cluster = require('cluster');
const os = require('os');

// Import configuration
const serverConfig = require('./config/server');

// Import middleware
const logger = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');
const compressionMiddleware = require('./middleware/compressionMiddleware');
const { cacheMiddleware } = require('./middleware/cacheMiddleware');
const { apiLimiter, cvAnalysisLimiter } = require('./middleware/rateLimitMiddleware');

// Import routes
const routes = require('./routes');

// Import services
const openaiService = require('./services/openaiService');

// Verify environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('\n❌ Error: OPENAI_API_KEY is not set in .env file');
  console.log('\n📝 Please follow these steps:');
  console.log('1. Create a .env file in the root directory if it doesn\'t exist');
  console.log('2. Add your OpenAI API key to the .env file:');
  console.log('   OPENAI_API_KEY=your_api_key_here');
  console.log('3. Make sure to replace "your_api_key_here" with your actual OpenAI API key');
  console.log('\n💡 If you don\'t have an API key, you can get one at:');
  console.log('   https://platform.openai.com/api-keys\n');
  process.exit(1);
}

// Determine if we should use clustering based on environment variable
const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';

// If clustering is enabled and this is the master process, fork workers
if (ENABLE_CLUSTERING && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  const workerCount = Math.min(numCPUs, 4); // Limit to 4 workers max
  
  console.log(`🚀 Master process running. Forking ${workerCount} workers...`);
  
  // Fork workers
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  
  // Handle worker exits and restart them
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // This is a worker process or clustering is disabled
  // Initialize Express app
  const app = express();

  // Security middleware
  app.use(helmet());

  // Compression middleware to reduce response size
  app.use(compressionMiddleware);

  // Request logging middleware
  app.use(logger);

  // CORS configuration
  app.use(cors(serverConfig.cors));

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);
  
  // Apply stricter rate limiting to resource-intensive endpoints
  app.use('/analyze', cvAnalysisLimiter);
  app.use('/api/archetype', cvAnalysisLimiter);

  // Apply caching to GET requests
  app.use('/api', cacheMiddleware(300)); // 5 minutes cache for API endpoints

  // Static file serving with cache control
  app.use('/static', express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true
  }));

  // Serve SVG files directly from the img/svg directory
  app.use('/img/svg', express.static(path.join(__dirname, 'public/img/svg'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  // Serve font files directly from the fonts directory
  app.use('/fonts', express.static(path.join(__dirname, 'public/fonts'), {
    maxAge: '7d', // Cache fonts for 7 days
    etag: true,
    lastModified: true
  }));

  // Register all routes
  app.use('/', routes);

  // Error handling middleware
  app.use(errorHandler);

  // Function to start server
  const startServer = (port) => {
    try {
      const server = app.listen(port, () => {
        console.log(`\n🚀 Server running on port ${port}`);
        console.log(`📊 API available at http://localhost:${port}`);
        console.log(`🔍 Health check at http://localhost:${port}/health`);
        console.log(`\n🧠 Testing OpenAI connection...`);
        
        // Test OpenAI connection
        openaiService.testOpenAIConnection()
          .then(success => {
            if (success) {
              console.log(`✅ OpenAI connection successful! Server is ready to analyze CVs.`);
            } else {
              console.error(`❌ OpenAI connection failed. Please check your API key and network connection.`);
            }
          })
          .catch(error => {
            console.error(`❌ Error testing OpenAI connection:`, error.message);
          });
      });

      // Handle server errors
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`\n⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
          startServer(port + 1);
        } else {
          console.error('Server error:', error);
        }
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  };

  // Start server with initial port
  const initialPort = serverConfig.port;
  startServer(initialPort);

  // Export app for testing
  module.exports = app;
}