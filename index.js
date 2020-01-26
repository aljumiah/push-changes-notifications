const express = require('express');
const http = require('http');
const hostname = 'localhost';
const port = 3000;
const app = express();
const bodyParser = require('body-parser');
const ClientsRouter = require('./routes/clientsRouter');
const infoRouter = require('./routes/infoRouter');
const actions = require('./components/actions')

app.use('/clients', ClientsRouter);
app.use('/info', infoRouter);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  actions.prepareSubscribers();
});