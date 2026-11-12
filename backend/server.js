const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studysync';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Schema & Model (Includes Schedule Date & Time)
const Task = mongoose.model('Task', new mongoose.Schema({
  subject: String,
  topic: String,
  date: String,
  time: String
}));

// REST Routes
app.get('/tasks', async (req, res) => {
  res.json(await Task.find());
});

app.post('/tasks', async (req, res) => {
  res.json(await new Task(req.body).save());
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
