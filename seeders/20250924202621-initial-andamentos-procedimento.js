'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // O nome da tabela é o plural do nome do modelo: 'AndamentoProcedimentos'
    await queryInterface.bulkInsert('AndamentoProcedimentos', [
      { nome: 'Em Investigação', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Aguardando Laudo Pericial', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Relatado e Remetido à Justiça', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Aguardando Decisão Judicial', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Arquivado', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AndamentoProcedimentos', null, {});
  }
};