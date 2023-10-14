'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Film extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Film.belongsTo(models.User, {foreignKey : "user_id"})
    }
  }
  Film.init({
    title: DataTypes.STRING,
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Film',
  });
  return Film;
};