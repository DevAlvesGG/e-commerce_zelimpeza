const jwt = require('jsonwebtoken')

//middleware que valida o token se é valido ou nao 
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization; // formato esperado: "Bearer <token>"
    if(!authHeader) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido'})
    }

    const [scheme, token] = authHeader.split(' ');
    if(scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, name, role, iat, exp }
        next();// token válido, segue para o Controller

    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado'})
    }
}


module.exports = authMiddleware;