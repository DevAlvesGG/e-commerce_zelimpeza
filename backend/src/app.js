const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser())
routes(app);

app.use(errorHandler);

module.exports = app;
