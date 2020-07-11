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
  };

  return Task;
};
