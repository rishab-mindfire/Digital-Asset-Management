import express from 'express';
import cors from 'cors';

import authRoleBased from './middlewares/authRoleBased.middleware.js';
import { userRouter } from './router/user.routes.js';
import { adminRouter } from './router/admin.routes.js';

const app = express();

const frontend_url = process.env.FRONTEND_URL || 'http://localhost:3001';
//cros policy :
const corsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
};
app.use(cors(corsOptions));

// JSON parser for body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/user', userRouter);
app.use('/admin', authRoleBased('admin'), adminRouter);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

export default app;
