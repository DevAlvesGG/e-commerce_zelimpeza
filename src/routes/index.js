const authRoutes = require('./authRoutes.js');
module.exports = app => {
    app.use('/api/auth', authRoutes);
}