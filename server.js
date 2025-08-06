const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the client build if present
const clientBuild = path.join(__dirname, 'client', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

// Example API endpoint
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
