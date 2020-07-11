'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      creator: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users',
          },
        },
        key: 'id',
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users',
          },
        },
        key: 'id',
      },
      status: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'TaskStatuses',
          },
        },
        key: 'id',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tasks');
  }
};
