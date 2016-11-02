require('dotenv').config();

const app = require('express')();
const API = require('json-api');
const mongoose = require('mongoose');

const db = mongoose.connection;

mongoose.connect(process.env.DB_HOST);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('info', 'Connected to database !');
});

const allowHeaders = ['Origin', 'X-Requested-With', 'Content-Type', 'Accept',
  'Cache-Control', 'Authorization'];


app.use(require('morgan')('dev'));

const models = {
  User: require('./models/user').model
};

const registryTemplates = {
  users: require('./models/user').registry
};

const opts = ['users'].join('|');

const adapter = new API.dbAdapters.Mongoose(models);
const registry = new API.ResourceTypeRegistry(registryTemplates,
  {dbAdapter: adapter});
const docs = new API.controllers.Documentation(registry, {name: 'CFS'});
const controller = new API.controllers.API(registry);
const front = new API.httpStrategies.Express(controller, docs);
const apiReqHandler = front.apiRequest.bind(front);

app.options('/api/*', (req, res) => {
  res.send();
});

app.get('/api', front.docsRequest.bind(front));
app.route(`/api/:type(${opts})`)
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler);

app.route(`/api/:type(${opts})/:id`)
  .get(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);

app.route(`/api/:type(${opts})/:id/relationship/:relationship`)
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler)
  .delete(apiReqHandler);

app.use((req, res, next) => {
  front.sendError(new API.types.Error(404, undefined, 'Not found'), req, res);
  next();
});

const server = app.listen(process.env.PORT, () => {
  const host = process.env.HOST;
  const port = server.address().port;
  console.log('info', `Codeur fighting simulator API listening at ${host}:${port}`);
});
