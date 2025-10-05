'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ocorrencia extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId' });
      this.belongsTo(models.Cidade, { foreignKey: 'cidadeId' });
      this.hasMany(models.Vitima, { foreignKey: 'ocorrenciaId', as: 'Vitimas' });
      this.hasMany(models.Infrator, { foreignKey: 'ocorrenciaId', as: 'Infrators' });
      this.hasMany(models.PedidoCautelar, { foreignKey: 'ocorrenciaId', as: 'PedidoCautelars' });
    }
  }
  Ocorrencia.init({
    dataCrime: DataTypes.DATE,
    bairro: DataTypes.STRING,
    faccaoArea: DataTypes.STRING,
    numeroInquerito: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Este número de inquérito já está cadastrado no sistema.'
      },
      validate: {
        is: {
          args: /^\d{3}-\d{5}\/\d{4}$/,
          msg: 'O número do inquérito deve seguir o formato xxx-xxxxx/xxxx.'
        }
      }
    },
    quantidadeVitimas: DataTypes.INTEGER,
    crimeElucidado: DataTypes.BOOLEAN,
    quantidadeInfratores: DataTypes.INTEGER,
    numeroProcessoPrincipal: { // <-- CAMPO CORRIGIDO
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        // Validação customizada para aplicar a regra apenas se o campo for preenchido
        isProcessoFormat(value) {
          if (value && value.length > 0) {
            const regex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
            if (!regex.test(value)) {
              throw new Error('O número do processo principal deve seguir o formato xxxxxxx-xx.xxxx.x.xx.xxxx');
            }
          }
        }
      }
    },
    andamentoProcedimento: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    cidadeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ocorrencia',
    tableName: 'Ocorrencia',
    freezeTableName: true,
  });
  return Ocorrencia;
};