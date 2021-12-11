const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const logsSchema = new Schema({
    username: {type: String, required:true},
    count: {type: Number, default: 0},
    log: [
        {
            description: {type: String, required:true},
            duration: {type: Number, required:true},
            date: {type: String, required:true}
        }
    ]
}, { timestamp: true, _id: true, autoIndex: true });


module.exports = mongoose.model('Logs', logsSchema);
