'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bairro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define a associação correta que já implementamos
      Bairro.belongsTo(models.Cidade, {
        foreignKey: 'cidadeId',
        as: 'Cidade'
      });
    }
  }
  Bairro.init({
    nome: DataTypes.STRING,
    cidadeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Bairro',
  });
  return Bairro;
};