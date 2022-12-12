const mongoose = require('mongoose');

exports.connect = function () {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'dms',
    });
    mongoose.connection.on('connected', () => {
        console.log('Mongoose is connected');
    });
};
