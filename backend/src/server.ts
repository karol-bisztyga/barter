import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import likeRoutes from './routes/likeRoutes';

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/', [itemRoutes, likeRoutes]);

const { SERVER_PORT } = process.env;

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
