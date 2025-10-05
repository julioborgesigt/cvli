'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vitima extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Ocorrencia, { foreignKey: 'ocorrenciaId' });
    }
  }
  Vitima.init({
    nome: DataTypes.STRING,
    faccao: DataTypes.STRING,
    ocorrenciaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Vitima',
  });
  return Vitima;
};