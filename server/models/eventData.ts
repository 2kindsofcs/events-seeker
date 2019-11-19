import { Model, DataTypes } from 'sequelize';

class EventData extends Model {
  public id!: number;
  public eventList!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default EventData;

import sequelize from './index';

EventData.init({
  eventList: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  charset: 'utf8mb4',
  tableName: 'eventData',
});
