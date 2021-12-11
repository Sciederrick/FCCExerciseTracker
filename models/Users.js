const mongoose = require('mongoose');
const logsModel = require('./Logs');

const Schema = mongoose.Schema;
const usersSchema = new Schema({
    username: {type: String, required: true}
}, { timestamp: true, _id: true, autoIndex: true });

usersSchema.post('save', async function(doc, next) {
    try {
        let log = new logsModel();
        log.username = doc.username;
        log.count = 0;
        log.log = [];
        await log.save();
        next();
    } catch (err) {
        next();
    }
});

module.exports = mongoose.model('Users', usersSchema);