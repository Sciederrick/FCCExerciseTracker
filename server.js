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
    console.log(err)
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
    const date = typeof(req.body.date) === 'string' && req.body.date.trim().length > 0 ? req.body.date.trim() : new Date().toDateString();

    if(!userId) throw 'invalid user id';
    if(!description) throw 'invalid description';
    if(!duration) throw 'invalid duration';
    if(!date) throw 'invalid date';

    let username = await usersModel.find({_id:userId}, 'username').exec();
    username = username[0].username;
    if(!username) throw 'unable to get username';

    const exercise = new exercisesModel({
      username: username,
      description: description,
      duration: duration,
      date: date
    });
    const newExercise = await exercise.save();
    if(!(newExercise === exercise)) throw 'unable to save exercise';

    exercise._id = userId;
    res.json(exercise);
  } catch(err) {
    res.json({ error: err });
  }
});

app.get('/api/users/:_id/logs', async(req, res) => {
  const from = typeof(req.params.from) === 'string' && req.params.from.trim().length > 0 ? req.params.from.trim() : false;
  const to = typeof(req.params.to) === 'string' && req.params.to.trim().length > 0 ? req.params.to.trim() : false;
  const limit = typeof(req.params.limit) === 'number' ? req.params.limit : false;
  const userId = typeof(req.params._id) === 'string' && req.params._id.trim().length > 0 ? req.params._id.trim() : false;
  
  try {
    if (!userId) throw 'invalid user id';
  
    let username = await usersModel.find({_id:userId}, 'username').exec();
    username = username[0].username;
    if(!username) throw 'unable to get username';
  
    const logs = await logsModel.find({username: username}).exec();
    res.send(logs);
  } catch(err) {
    res.json({ error: err });
  }

});

app.get('/api/users/:id/logs', async(req, res) => {
  const userId = typeof(req.params.id) === 'string' && req.params.id.trim().length > 0 ? req.params.id.trim() : false;
  try {
    if (!userId) throw 'invalid user id';
    const username = await usersModel.find({_id: userId}, 'username').exec();
    if(!username) throw 'unable to fetch username';
    const logs = await logsModel.find({ username: username }).exec();
    if (!logs) throw "didn't find logs under that username";

    res.json(logs);
  } catch (err) {
    res.json({ error: err });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  db.init();
  console.log('Your app is listening on port ' + listener.address().port)
})
