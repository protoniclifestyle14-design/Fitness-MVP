const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the client build if present
const clientBuild = path.join(__dirname, 'client', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

//
Example API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MVP server is running' });
});

// Serve index.html for all other routes if client build exists
app.get('*', (req, res) => {
  const indexPath = path.join(clientBuild, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('MVP server is running. Add a React client in /client.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// Sample data for workouts and barbers
const workouts = [
  { id: 1, name: 'HIIT Beginner', duration: '30 min', description: 'High-intensity with grooming tips.' },
  { id: 2, name: 'Strength Training', duration: '45 min', description: 'Full-body strength session.' }
];

const barbers = [
  { id: 1, name: "Mario's Barber Shop", location: 'Alum Rock area', price: '$20-$30' },
  { id: 2, name: 'X9 Barbershop', location: 'Various', price: 'Under $40' }
];

// API endpoint to return workouts
app.get('/api/workouts', (req, res) => {
  res.json(workouts);
});

// API endpoint to return barbers
app.get('/api/barbers', (req, res) => {
  res.json(barbers);
});
