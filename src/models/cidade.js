'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cidade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Seccional, { foreignKey: 'seccionalId' }); // <-- ADICIONE ESTA LINHA
      this.hasMany(models.User, { foreignKey: 'cidadeId' });
      this.hasMany(models.Ocorrencia, { foreignKey: 'cidadeId' });
    }
  }
  Cidade.init({
    nome: DataTypes.STRING,
    seccionalId: DataTypes.INTEGER,
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Cidade',
  });
  return Cidade;
};