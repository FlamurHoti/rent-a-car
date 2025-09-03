const app    = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Rent-a-Car API running on http://localhost:${config.port}`);
});
