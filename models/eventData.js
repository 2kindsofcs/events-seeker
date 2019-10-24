module.exports = (sequelize, DataTypes) => {
  return sequelize.define('eventData', {
    eventIdList: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
  });
};

