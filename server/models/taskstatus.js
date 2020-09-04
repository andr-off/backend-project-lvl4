import i18next from 'i18next';

module.exports = (sequelize, DataTypes) => {
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
            throw new Error(i18next.t('validation.taskStatuses.nameLength'));
          }
        },
      },
    },
  }, {
    scopes: {
      usedStatuses: {
        include: [
          { model: sequelize.models.Task, required: true },
        ],
      },
    },
  });

  TaskStatus.associate = (models) => {
    TaskStatus.hasMany(models.Task, {
      foreignKey: 'status',
    });
  };

  return TaskStatus;
};
