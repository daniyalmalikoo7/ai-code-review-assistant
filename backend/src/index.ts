import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
