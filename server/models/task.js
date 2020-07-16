export default (sequelize, DataTypes) => {
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
            throw new Error('Name must be at least 3 characters long');
          }
        },
      },
    },
    description: DataTypes.TEXT,
  }, {
    scopes: {
      getMyTasks(userId) {
        return {
          include: [
            { model: sequelize.models.User, as: 'maker', where: { id: userId } },
          ],
        };
      },
      getAssigneeTasks(assigneeId) {
        return {
          include: [
            { model: sequelize.models.User, as: 'assignee', where: { id: assigneeId } },
          ],
        };
      },
      getTasksByStatus(statusId) {
        return {
          include: [
            { model: sequelize.models.TaskStatus, where: { id: statusId } },
          ],
        };
      },
      getTasksByTag(tagId) {
        return {
          include: [
            { model: sequelize.models.Tag, as: 'tags', where: { id: tagId } },
          ],
        };
      },
    },
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
