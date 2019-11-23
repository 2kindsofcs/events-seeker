import { Model, DataTypes, Sequelize } from 'sequelize';

class User extends Model {
  public id!: number;
  public userId!: string;
  public isPush!: boolean;
  public cycle!: string;
}

export default User;

export function initUser(sequelize: Sequelize) {
  User.init({
    userId: DataTypes.STRING,
    isPush: DataTypes.BOOLEAN,
    cycle: DataTypes.STRING,
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false, // CreatedAt, UpdatedAt will not be generated
    charset: 'utf8mb4',
    sequelize,
  });  
}
