import { QueryInterface, DataTypes } from "sequelize/types";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    eventIdList: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  return queryInterface.addIndex('eventData', ['id']);
}

export async function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('eventData');
};
