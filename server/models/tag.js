import i18next from 'i18next';

module.exports = (sequelize, DataTypes) => {
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
            throw new Error(i18next.t('validation.tags.nameLength'));
          }
        },
      },
    },
  }, {
    defaultScope: {
      order: [['createdAt', 'DESC']],
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
