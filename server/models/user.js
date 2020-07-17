import encrypt from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'This field must be filled out',
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
            throw new Error('Password must be at least 4 characters long');
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
  };

  return User;
};
