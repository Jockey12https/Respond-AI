const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let mode = 'NORMAL';
const crises = [
  { id: 1, type: 'ACTIVE', location: { lat: 8.524, lng: 76.936 }, battery: '80%', network: 'GOOD', description: 'Flooding near river' }
];
const alerts = [
  { id: 'a1', title: 'Storm Warning', body: 'Heavy rains expected tonight', from: 'Authority', time: new Date().toISOString() }
];

app.get('/api/mode', (req, res) => {
  res.json({ mode });
});

app.post('/api/mode', (req, res) => {
  const m = req.body?.mode;
  if (m) {
    mode = m;
    return res.json({ ok: true, mode });
  }
  res.status(400).json({ ok: false, error: 'mode required' });
});

app.get('/api/crisis', (req, res) => {
  res.json(crises);
});

app.post('/api/crisis/report', (req, res) => {
  const body = req.body || {};
  const id = crises.length + 1;
  const item = { id, ...body };
  crises.push(item);
  alerts.unshift({ id: 'a' + Date.now(), title: 'New Report', body: body.description || body.note || 'User reported an incident', from: 'User', time: new Date().toISOString() });
  console.log('Received report:', item);
  res.json({ ok: true, id });
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Respond-AI backend listening on port', port));
