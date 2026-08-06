import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import config from './config/env';
import connectDB from './config/db';
import apiRoutes from './routes/api.routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { SocketManager } from './socket/socket';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);

// 1. Establish Database Connection
connectDB();

// 2. Setup Security and Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Setup Morgan/Winston Request Logging
app.use(requestLogger);

// Mount Swagger Routes BEFORE Rate Limiter
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 4. Mount API Rate Limiter
app.use('/api', apiRateLimiter);

// 5. Mount API Routes
app.use('/api', apiRoutes);

// Mock home route for validation
app.get('/', (req, res) => {
  res.status(200).send('Trim Tokyo AI Receptionist Backend is active.');
});

// 6. Global Error Handling Middleware
app.use(errorHandler);

// 7. Initialize Socket.io Manager
const socketManager = new SocketManager(server, config.clientUrl);

// 8. Start HTTP / WebSocket Server
server.listen(config.port, () => {
  logger.info(`Server successfully started on port ${config.port} in ${config.nodeEnv} mode.`);
});

export default server;
