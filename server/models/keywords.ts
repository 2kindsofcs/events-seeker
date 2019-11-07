import { Model, DataTypes } from 'sequelize';

class Keywords extends Model {
  public id!: number;
  public userId!: string;
  public keyword!: string;
}

export default Keywords;

import sequelize from './index';

Keywords.init({
  userId: DataTypes.STRING,
  keyword: DataTypes.STRING,
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  timestamps: false, // CreatedAt, UpdatedAt will not be generated
  sequelize,
});
