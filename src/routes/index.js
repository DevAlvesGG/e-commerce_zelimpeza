const authRoutes = require('./authRoutes.js');
const productRoutes = require('../routes/productRoutes.js')
module.exports = app => {
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
}