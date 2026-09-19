require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const app = require('./src/app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})