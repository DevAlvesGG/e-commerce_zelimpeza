const welcomeRoutes = require('./welcomeRoutes.js');

module.exports = app => {
    app.use(welcomeRoutes);
}