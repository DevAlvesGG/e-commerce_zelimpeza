function errorHandler(err, req, res, next) {
    console.error(err); // log completo no servidor, para debugar

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Erro interno no servidor.' : err.message; // se o codigo de erro for igual a 500, exibe a mensagem generica, se não, exibe a mensagem de erro real

    res.status(statusCode).json({ error: message})
}

module.exports = errorHandler;