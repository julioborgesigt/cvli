// src/app.js
require('dotenv').config();
const express = require('express');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');
const { sequelize } = require('./models'); // <-- Importe o sequelize dos modelos
const authRoutes = require('./routes/authRoutes'); // <-- Importe nossas rotas
const userRoutes = require('./routes/userRoutes'); // <-- IMPORTE AS NOVAS ROTAS
const ocorrenciaRoutes = require('./routes/ocorrenciaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const optionsRoutes = require('./routes/optionsRoutes');
const bairroRoutes = require('./routes/bairroRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pedidoCautelarRoutes = require('./routes/pedidoCautelarRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // <-- Habilita o app para receber JSON no corpo das requisições
app.use(cors());


app.use('/api', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/ocorrencias', ocorrenciaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/stats', statisticsRoutes);
app.use('/api', optionsRoutes);
app.use('/api/bairros', bairroRoutes);
app.use('/api/dashboard', dashboardRoutes); // <-- ADICIONE ESTA LINHA
app.use('/api/pedidos', pedidoCautelarRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API do Projeto CVLI está no ar!');
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Não foi possível conectar ao banco de dados:', error);
  }
});