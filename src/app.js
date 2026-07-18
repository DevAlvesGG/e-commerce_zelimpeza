const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
routes(app);
app.use(errorHandler);

module.exports = app;
