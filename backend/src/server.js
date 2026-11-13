import express from 'express';
import cors from 'cors';
import { getProducts, getProductsMeta } from './controllers/productController.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // Allow requests from local frontend during dev
  methods: ['GET', 'OPTIONS']
}));
app.use(express.json());

// Request logger for debugging & development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Product API routes
app.get('/api/products', getProducts);
app.get('/api/products/meta', getProductsMeta);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start listening if run directly and not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`Product API available at http://localhost:${PORT}/api/products`);
  });
}

export { server };
export default app;
