'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@demo.ru',
      passwordDigest: '290d846cdc28cf58c8991685ed8c87926740be345e90996b8975c7a7e9886dd7',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
