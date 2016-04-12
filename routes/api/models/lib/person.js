'use strict';

module.exports = (sequelize, Types) => {
  return sequelize.define('person', {
    firstName: {
      type: Types.STRING,
      validate: { notEmpty: true }
    },
    lastName: {
      type: Types.STRING,
      validate: { notEmpty: true }
    },
    email: {
      type: Types.STRING,
      validate: { isEmail: true }
    }
  });
};
