// models/user.js
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // <-- Importe o bcrypt

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define as associações
      this.belongsTo(models.Cidade, { foreignKey: 'cidadeId' });
      this.belongsTo(models.Seccional, { foreignKey: 'seccionalId' });
      this.hasMany(models.Ocorrencia, { foreignKey: 'userId' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nomeDelegacia: DataTypes.STRING,
    responsavelCadastro: DataTypes.STRING,
    cidadeId: DataTypes.INTEGER,
    seccionalId: DataTypes.INTEGER,
    isAdmin: {                       // <-- ADICIONE ESTE BLOCO
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }    ,
    
    isFirstLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }                           // <-- ATÉ AQUI
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',      // <-- ADICIONE ESTA LINHA
    freezeTableName: true,   // <-- ADICIONE ESTA LINHA
    hooks: {  // <-- Adiciona o hook para criptografar a senha
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};