'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // O nome da tabela provavelmente é 'PedidoCautelars' (pluralizado pelo Sequelize)
    await queryInterface.addColumn('PedidoCautelars', 'senha', {
      type: Sequelize.STRING,
      allowNull: true, // Campo não obrigatório
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('PedidoCautelars', 'senha');
  }
};