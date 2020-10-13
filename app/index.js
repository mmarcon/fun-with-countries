const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const exphbs = require('express-handlebars');

const port = process.env.PORT || 3000;
// If you are connecting to Atlas, you can pass your connection string
// as an environment variable or assign it directly to the variable below.
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const getRandomCountryAggregation = () => [{
  $sample: {
    size: 1
  }
},
{
  $lookup: {
    from: 'all',
    localField: 'borders',
    foreignField: 'alpha3Code',
    as: 'borderCountries'
  }
}];

const getCountryAggregation = (alpha3Code) => [{
  $match: {
    alpha3Code
  }
},
{
  $lookup: {
    from: 'all',
    localField: 'borders',
    foreignField: 'alpha3Code',
    as: 'borderCountries'
  }
}];

(async function () {
  // Connection URL
  const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db('countries');
    const collection = db.collection('all');

    app.get('/', async (req, res) => {
      // Start with a random country
      const country = await collection.aggregate(getRandomCountryAggregation()).next();
      res.render('country', country);
    });

    app.get('/:alpha3Code', async (req, res) => {
      const { alpha3Code } = req.params;
      const country = await collection.aggregate(getCountryAggregation(alpha3Code)).next();
      res.render('country', country);
    });

    app.listen(port, () => { console.log(`App listening at http://localhost:${port}`); });
  } catch (err) {
    console.log(err.stack);
  }

  process.on('SIGINT', async () => {
    await client.close();
    process.exit();
  });
})();
