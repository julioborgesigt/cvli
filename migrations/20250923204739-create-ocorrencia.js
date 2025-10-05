'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ocorrencia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dataCrime: {
        type: Sequelize.DATE
      },
      bairro: {
        type: Sequelize.STRING
      },
      faccaoArea: {
        type: Sequelize.STRING
      },
      numeroInquerito: {
        type: Sequelize.STRING
      },
      quantidadeVitimas: {
        type: Sequelize.INTEGER
      },
      crimeElucidado: {
        type: Sequelize.BOOLEAN
      },
      quantidadeInfratores: {
        type: Sequelize.INTEGER
      },
      pedidosCautelaresFeitos: {
        type: Sequelize.BOOLEAN
      },
      numeroProcessoCautelar: {
        type: Sequelize.STRING
      },
      andamentoProcedimento: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER
      },
      cidadeId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Ocorrencia');
  }
};