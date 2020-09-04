import i18next from 'i18next';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      notEmpty: true,
      validate: {
        isLongEnough(value) {
          if (value.length < 3) {
            throw new Error(i18next.t('validation.tasks.nameLength'));
          }
        },
      },
    },
    description: DataTypes.TEXT,
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: 'creator',
      as: 'maker',
    });

    Task.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee',
    });

    Task.belongsTo(models.TaskStatus, {
      foreignKey: 'status',
      as: 'taskStatus',
    });

    Task.belongsToMany(models.Tag, {
      through: models.TaskTag,
      as: 'tags',
      foreignKey: 'taskId',
      otherKey: 'tagId',
    });
  };

  return Task;
};
