import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/', itemRoutes);

const { SERVER_PORT } = process.env;

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
