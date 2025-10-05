'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Ocorrencia', 'numeroProcessoPrincipal', {
      type: Sequelize.STRING,
      allowNull: true, // Permite que o campo seja opcional
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Ocorrencia', 'numeroProcessoPrincipal');
  }
};