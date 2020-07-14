export default (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    taskId: {
      type: DataTypes.INTEGER,
      notEmpty: true,
    },
    tagId: {
      type: DataTypes.INTEGER,
      notEmpty: true,
    },
  });
  return TaskTag;
};
