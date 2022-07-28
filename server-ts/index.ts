import { WebSocketServer } from 'ws';

const wsServer = new WebSocketServer({ host: 'localhost', port: 9000 });
wsServer.on('connection', (socket) => {
  const id = Math.random();
  console.log(`new client is connected ${id}`);
});
console.log('Server started');
