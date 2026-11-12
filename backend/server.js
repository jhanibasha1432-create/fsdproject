const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studysync';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const Task = mongoose.model('Task', new mongoose.Schema({
  subject: String,
  topic: String,
  date: String,
  time: String,
  status: { type: String, default: 'Pending' }
}));

app.get('/tasks', async (req, res) => res.json(await Task.find()));
app.post('/tasks', async (req, res) => res.json(await new Task(req.body).save()));
app.put('/tasks/:id', async (req, res) => {
  const t = await Task.findById(req.params.id);
  t.status = t.status === 'Completed' ? 'Pending' : 'Completed';
  res.json(await t.save());
});
app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
