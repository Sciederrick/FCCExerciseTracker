const express = require('express')
const app = express()
const cors = require('cors')
const db = require('./db')
require('dotenv').config()

const usersModel = require('./models/Users')
const exercisesModel = require('./models/Exercises')
const logsModel = require('./models/Logs')

app.use(cors())
app.use(express.urlencoded({ extended:true }))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async(req, res) => {
  const uname = typeof req.body.username === 'string' && req.body.username.trim().length > 0 ? req.body.username.trim() : false;
  try {
    if (uname) {
          const user = new usersModel({
            username: uname
          });
          const newUser = await user.save();

          if (!(user === newUser)) throw 'error saving new user';

          res.json(newUser);
    } else {
      throw 'invalid username';
    }
  } catch(err) {
    res.json({ error: err });
  }
});

app.get('/api/users', async(_, res) => {
  try {
    const users = await usersModel.find({}).exec();
    res.send(users);
  } catch(err) {
    res.status(500).json({ error: 'error fetching users' })
  }
});

app.post('/api/users/:_id/exercises', async(req, res) => {
  try {
    const userId = typeof(req.params._id) === 'string' && req.params._id.trim().length > 0 ? req.params._id.trim() : false;
    const description = typeof(req.body.description) === 'string' && req.body.description.trim().length > 0 ? req.body.description.trim() : false;
    const duration = typeof(req.body.duration) === 'string' ? Number(req.body.duration) : false;
    const date = typeof(req.body.date) === 'string' && req.body.date.trim().length > 0 ? new Date(req.body.date.trim()).toDateString() : new Date().toDateString();

    if(!userId) throw 'invalid user id';
    if(!description) throw 'invalid description';
    if(!duration) throw 'invalid duration';
    if(!date) throw 'invalid date';

    let username = await usersModel.find({_id:userId}, '_id username').exec();
    if(!username[0].username) throw 'unable to get username';

    const exercise = new exercisesModel({
      username: username[0].username,
      description: description,
      duration: duration,
      date: date
    });
    const newExercise = await exercise.save();
    if(!(newExercise === exercise)) throw 'unable to save exercise';

    const response = {
      _id: username[0].id, 
      username: username[0].username, 
      description: newExercise.description, 
      duration: newExercise.duration, 
      date: newExercise.date
    };

    res.json(response);
  } catch(err) {
    console.log(err)
    res.json({ error: err });
  }
});

app.get('/api/users/:_id/logs', async(req, res) => {
  const from = typeof(req.query.from) === 'string' && req.query.from.trim().length > 0 ? new Date(req.query.from.trim()).toDateString() : false;
  const to = typeof(req.query.to) === 'string' && req.query.to.trim().length > 0 ? new Date(req.query.to.trim()).toDateString() : false;
  const limit = typeof(req.query.limit) === 'string' ? Number(req.query.limit) : false;
  const userId = typeof(req.params._id) === 'string' && req.params._id.trim().length > 0 ? req.params._id.trim() : false;
  
  try {
    if (!userId) throw 'invalid user id';
  
    let username = await usersModel.find({_id:userId}, 'username').exec();
    username = username[0].username;
    if(!username) throw 'unable to get username';
  
    const logs = await logsModel.find({username: username, date: {$gte:from, $lte:to}}).exec();
    
    const filteredLogs = logs[0].log.slice(limit*-1);
    const response = {
      _id: logs[0]._id.toString(),
      username: logs[0].username,
      count: logs[0].count,
      log: filteredLogs
    };

    res.send(response);
  } catch(err) {
    res.json({ error: err });
  }

});

const listener = app.listen(process.env.PORT || 3000, () => {
  db.init();
  console.log('Your app is listening on port ' + listener.address().port)
})
