import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import likeRoutes from './routes/likeRoutes';
import matchRoutes from './routes/matchRoutes';
import { runSocketServer } from './socketServer/socketServer';

const app = express();

const httpServer = http.createServer(app);

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/', [itemRoutes, likeRoutes, matchRoutes]);

const { SERVER_PORT } = process.env;

runSocketServer(httpServer);

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
