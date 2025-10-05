'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Ocorrencia', 'pedidosCautelaresFeitos');
    await queryInterface.removeColumn('Ocorrencia', 'numeroProcessoCautelar');
  },
  down: async (queryInterface, Sequelize) => {
    // Opcional: código para reverter, se necessário
    await queryInterface.addColumn('Ocorrencia', 'pedidosCautelaresFeitos', { type: Sequelize.BOOLEAN });
    await queryInterface.addColumn('Ocorrencia', 'numeroProcessoCautelar', { type: Sequelize.STRING });
  }
};