import i18next from 'i18next';
import encrypt from '../lib/secure';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        isLongEnough(value) {
          if (value.length < 2) {
            throw new Error(i18next.t('validation.users.nameLength'));
          }
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Invalid email',
        },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
      },
      validate: {
        isLongEnough(value) {
          if (value.length < 4) {
            throw new Error(i18next.t('validation.users.passwordLenght'));
          }
        },
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    defaultScope: {
      order: [['createdAt', 'DESC']],
    },
    scopes: {
      usedAssignees: {
        include: [
          { model: sequelize.models.Task, required: true },
        ],
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: 'assignedTo',
    });

    User.hasMany(models.Task, {
      foreignKey: 'creator',
    });
  };

  return User;
};
