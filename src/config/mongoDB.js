const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,  useCreateIndex:true})
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));


module.exports=mongoose;