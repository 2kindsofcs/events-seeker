module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    userId: DataTypes.STRING,
    keywords: DataTypes.STRING,
    isPush: DataTypes.BOOLEAN,
    cycle: DataTypes.STRING,
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false, // CreatedAt, UpdatedAt will not be generated
  });
};
