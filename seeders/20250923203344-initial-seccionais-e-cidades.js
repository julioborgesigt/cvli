// seeders/xxxxxxxx-initial-seccionais-e-cidades.js
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Inserir Seccionais
    await queryInterface.bulkInsert('Seccionals', [
      { id: 1, nome: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nome: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nome: '3', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nome: '4', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, nome: '5', createdAt: new Date(), updatedAt: new Date() },
    ], {});

    // Inserir Cidades
    await queryInterface.bulkInsert('Cidades', [
      // Seccional 1 (exemplo)
      { nome: 'Iguatu', seccionalId: 1, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Jucás', seccionalId: 1, createdAt: new Date(), updatedAt: new Date() },
      // Seccional 2 (exemplo)
      { nome: 'Saboeiro', seccionalId: 2, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Várzea Alegre', seccionalId: 2, createdAt: new Date(), updatedAt: new Date() },
      // Seccional 3 (exemplo)
      { nome: 'Acopiara', seccionalId: 3, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Icó', seccionalId: 3, createdAt: new Date(), updatedAt: new Date() },
      // Seccional 4 (exemplo)
      { nome: 'Cedro', seccionalId: 4, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Lavras da Mangabeira', seccionalId: 4, createdAt: new Date(), updatedAt: new Date() },
      // Seccional 5 (exemplo)
      { nome: 'Ipaumirim', seccionalId: 5, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Orós', seccionalId: 5, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cidades', null, {});
    await queryInterface.bulkDelete('Seccionais', null, {});
  }
};