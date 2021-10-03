const mongoose = require('mongoose');
module.exports = function DBConnect() {
    mongoose
        .connect(process.env.DB)
        .then(() => {
            console.log('DB Connected...');
        })
        .catch(err => console.log(err));
};