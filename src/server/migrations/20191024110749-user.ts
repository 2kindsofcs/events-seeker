import { QueryInterface, DataTypes } from "sequelize/types";

export async function up(queryInterface: QueryInterface) {
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
      allowNull: true,
    },
    cycle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return queryInterface.addIndex('user', ['userId']);
}

export async function down(queryInterface: QueryInterface){
  return queryInterface.dropTable('user');
}
