const mongoose = require('mongoose');
const logsModel = require('./Logs');

const Schema = mongoose.Schema;
const exercisesSchema = new Schema({
    username: {type: String, required:true},
    description: {type: String, required: true},
    duration: {type: Number, required:true},
    date: {type: String, required:true}
}, { timestamp: true, _id: true, autoIndex: true });

exercisesSchema.post('save', async function(doc, next) {
    try {
        const filter = { username: doc.username };
    
        const update = { 
            $inc: {count: 1}, 
            $push: { 
                log: { description: doc.description, duration: doc.duration, date: doc.date }
            }
        };
    
        await logsModel.findOneAndUpdate(filter, update);
    
        next();
    } catch (err) {
        next();
    }
});

module.exports = mongoose.model('Exercises', exercisesSchema);