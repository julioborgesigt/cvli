'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seccional extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Cidade, { foreignKey: 'seccionalId' }); // <-- ADICIONE ESTA LINHA
      this.hasMany(models.User, { foreignKey: 'seccionalId' });
    }
  }
  Seccional.init({
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Seccional',
  });
  return Seccional;
};