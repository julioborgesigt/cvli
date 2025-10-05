'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PedidoCautelar extends Model {
    static associate(models) {
      this.belongsTo(models.Ocorrencia, { foreignKey: 'ocorrenciaId' });
    }
  }
  PedidoCautelar.init({
    tipo: DataTypes.STRING,
    andamento: DataTypes.STRING,
    numeroProcesso: { // <-- CAMPO CORRIGIDO
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        // Validação customizada para aplicar a regra apenas se o campo for preenchido
        isProcessoFormat(value) {
          if (value && value.length > 0) {
            const regex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
            if (!regex.test(value)) {
              throw new Error('O número do processo cautelar deve seguir o formato xxxxxxx-xx.xxxx.x.xx.xxxx');
            }
          }
        }
      }
    },
    senha: DataTypes.STRING,
    ocorrenciaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PedidoCautelar',
  });
  return PedidoCautelar;
};