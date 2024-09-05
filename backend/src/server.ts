import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import likeRoutes from './routes/likeRoutes';
import matchRoutes from './routes/matchRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import { runSocketServer } from './socketServer/socketServer';

const app = express();

const httpServer = http.createServer(app);

app.use(bodyParser.json({ limit: '10mb' }));

app.use('/auth', authRoutes);
app.use('/', [itemRoutes, likeRoutes, matchRoutes, messageRoutes, userRoutes, reportRoutes]);

runSocketServer(httpServer);

const { SERVER_PORT, PORT } = process.env;

const port = PORT || SERVER_PORT;

if (!port) {
  throw new Error('port not specified');
}

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
