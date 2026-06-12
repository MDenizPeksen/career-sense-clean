require('dotenv').config();
// Initialize Sentry before anything else so it can instrument http/express.
// No-op when SENTRY_DSN is unset.
require('./instrument');
const path = require('path');
const cluster = require('cluster');
const os = require('os');

// Configuration
const serverConfig = require('./config/server');

// App factory (middleware + routes; no listener)
const createApp = require('./app');

// Services used at startup
const openaiService = require('./services/openaiService');
const { sweepStaleUploads } = require('./services/fileProcessingService');

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

/**
 * Start the HTTP server on the given port, retrying the next port if it's busy.
 * @param {number} port
 */
const startServer = (port) => {
  const app = createApp();
  try {
    const server = app.listen(port, () => {
      console.log(`\n🚀 Server running on port ${port}`);
      console.log(`📊 API available at http://localhost:${port}`);
      console.log(`🔍 Health check at http://localhost:${port}/health`);

      // Clean up any orphaned upload files on startup, then hourly.
      const uploadsDir = path.join(__dirname, 'uploads');
      sweepStaleUploads(uploadsDir);
      setInterval(() => sweepStaleUploads(uploadsDir), 60 * 60 * 1000).unref();

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

// If clustering is enabled and this is the primary process, fork workers.
if (ENABLE_CLUSTERING && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const workerCount = Math.min(numCPUs, 4); // Limit to 4 workers max

  console.log(`🚀 Primary process running. Forking ${workerCount} workers...`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  // Handle worker exits and restart them
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process, or clustering disabled: serve directly.
  startServer(serverConfig.port);
}
