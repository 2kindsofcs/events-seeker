import { Model, DataTypes, Sequelize } from 'sequelize';

class EventData extends Model {
  public eventId!: number;
  public eventName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default EventData;

export function initEventData(sequelize: Sequelize) {
  EventData.init({
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    charset: 'utf8mb4',
    tableName: 'eventData',
  });
}
