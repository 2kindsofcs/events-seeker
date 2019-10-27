import { Model, DataTypes } from 'sequelize';

class EventData extends Model {
  public id!: number;
  public eventIdList!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default EventData;

import sequelize from './index';

EventData.init({
  eventIdList: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  sequelize,
});
