'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona um índice 'unique' à coluna 'numeroInquerito' da tabela 'Ocorrencia'
    await queryInterface.addConstraint('Ocorrencia', {
      fields: ['numeroInquerito'],
      type: 'unique',
      name: 'unique_numeroInquerito_constraint'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Ocorrencia', 'unique_numeroInquerito_constraint');
  }
};