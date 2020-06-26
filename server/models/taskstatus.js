export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      notEmpty: true,
      validate: {
        isLongEnough(value) {
          if (value.length < 3) {
            throw new Error('Name must be at least 3 characters long');
          }
        },
      },
    },
  }, {});

  return TaskStatus;
};
