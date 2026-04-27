import app from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 4001;

const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server started on ..... ${port}`);
  });

  server.on('error', (err: Error) => {
    if (err) {
      process.exit(1);
    }
  });
};

startServer();
