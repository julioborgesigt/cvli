'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TipoPedidoCautelars', [
      { nome: 'P. Temporária', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'P. Preventiva', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Busca e Apreensão', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Quebra de dados telemáticos', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Busca e Apreensão de objetos', createdAt: new Date(), updatedAt: new Date() },
    ], {});
    
    await queryInterface.bulkInsert('StatusPedidoCautelars', [
      { nome: 'Remetido', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Aguarda MP', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Aguarda Decisão', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Deferido', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Deferido e cumprido', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Não deferido', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TipoPedidoCautelars', null, {});
    await queryInterface.bulkDelete('StatusPedidoCautelars', null, {});
  }
};