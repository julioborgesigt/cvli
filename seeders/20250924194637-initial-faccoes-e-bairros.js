'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Faccaos', [
      { nome: 'CV', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'GDE', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'TCP', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'PCC', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'N/A', createdAt: new Date(), updatedAt: new Date() },
    ], {});
    
    await queryInterface.bulkInsert('Bairros', [
      { nome: 'Centro', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Vila Alta', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Jardim Oásis', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Planalto', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Cocobó', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Faccoes', null, {});
    await queryInterface.bulkDelete('Bairros', null, {});
  }
};
