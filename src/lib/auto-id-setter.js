// auto-id-setter.js

const autoIdSetter = require('mongoose-sequence');

/**
 * 해당 스키마에 자동 증가 필드를 추가시켜줍니다.
 * @param {Schema} schema
 * @param {Mongoose} mongoose
 */

module.exports = (schema, mongoose, name, inc_field) => {
  const AutoIncrement = autoIdSetter(mongoose);
  const option = {id: `${name}_${inc_field}`, inc_field };
  schema.plugin(AutoIncrement, option);
};