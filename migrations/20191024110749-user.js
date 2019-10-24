'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPush: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
    return queryInterface.addIndex('user', ['userId']);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user');
  },
};
