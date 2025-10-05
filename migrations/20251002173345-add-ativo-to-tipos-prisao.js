'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Altere 'Faccoes' para o nome da tabela correta
    await queryInterface.addColumn('TipoPrisaos', 'ativo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Altere 'Faccoes' para o nome da tabela correta
    await queryInterface.removeColumn('TipoPrisaos', 'ativo');
  }
};