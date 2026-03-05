'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || '4sis@pc.ce.gov.br';
    const adminPass  = process.env.ADMIN_PASS  || '12345678';

    const hashedPassword = await bcrypt.hash(adminPass, 10);

    // Insere o admin somente se ele ainda não existir
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = ? LIMIT 1`,
      { replacements: [adminEmail], type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!existing) {
      await queryInterface.bulkInsert('Users', [{
        email:       adminEmail,
        password:    hashedPassword,
        isAdmin:     true,
        isFirstLogin: false,
        createdAt:   new Date(),
        updatedAt:   new Date()
      }], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || '4sis@pc.ce.gov.br';
    await queryInterface.bulkDelete('Users', { email: adminEmail }, {});
  }
};