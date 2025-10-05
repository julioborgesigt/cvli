// src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Às vezes, um erro pode vir com um código de status já definido.
  // Se não, o padrão é 500 (Erro Interno do Servidor).
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Envia uma resposta JSON padronizada
  res.json({
    message: err.message,
    // IMPORTANTE: A "pilha de erros" (stack trace) só será enviada se
    // não estivermos em um ambiente de produção. Isso evita vazar
    // informações sensíveis do servidor.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};