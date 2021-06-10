const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,  useCreateIndex:true, useFindAndModify:false})
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.log(e))

module.exports = mongoose