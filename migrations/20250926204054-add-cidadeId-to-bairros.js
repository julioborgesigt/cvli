'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Bairros', 'cidadeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Cidades', // Nome da tabela
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bairros', 'cidadeId');
  }
};