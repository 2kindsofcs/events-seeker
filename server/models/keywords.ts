import { Model, DataTypes, Sequelize } from 'sequelize';

class Keywords extends Model {
  public id!: number;
  public userId!: string;
  public keyword!: string;
}

export default Keywords;

export function initKeywords(sequelize: Sequelize) {
  Keywords.init({
    userId: DataTypes.STRING,
    keyword: DataTypes.STRING,
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false, // CreatedAt, UpdatedAt will not be generated
    charset: 'utf8mb4',
    sequelize,
  });
}
