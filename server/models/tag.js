export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
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
          if (value.length < 2) {
            throw new Error('Name must be at least 2 characters long');
          }
        },
      },
    },
  }, {
    scopes: {
      usedTags() {
        return {
          include: [
            { model: sequelize.models.Task, required: true },
          ],
        };
      },
    },
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, {
      through: models.TaskTag,
      foreignKey: 'tagId',
      otherKey: 'taskId',
    });
  };

  return Tag;
};
