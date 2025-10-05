// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
// 1. IMPORTE OS MODELOS NECESSÁRIOS
const { User, Cidade, Seccional } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. MODIFIQUE A CONSULTA PARA INCLUIR OS MODELOS RELACIONADOS
      req.user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
        include: [
          { model: Cidade },
          { model: Seccional }
        ]
      });

      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token encontrado.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
  }
};

module.exports = { protect, adminOnly };