const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

class Person {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

const Hugo = new Person('Hugo', 139605772);
const Valentin = new Person('Valentin', 100400572);
const Dakoona = new Person('Dakoona', 147668769)

const people = [Hugo, Valentin, Dakoona];

// URL du profil Strava public
function stravaUrl(person) {
    return `https://www.strava.com/athletes/${person.id}`;
}

const getDistanceData = async (person) => {
  try {
    const { data } = await axios.get(stravaUrl(person));
    const $ = cheerio.load(data);

    const distanceText = $('div.ProfileEveryone_metrics__wnvzB .Stat_statValue__3_kAe').first().text();
    const profileImage = $('div.Avatar_imgWrapper__dQxfF img').attr('src');

    return { name: person.name, distanceText, profileImage };
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    return null;
  }
};

// Endpoint pour récupérer les stats des utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const results = await Promise.all(people.map(person => getDistanceData(person)));
    res.json(results.filter(result => result !== null));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  }
});

// Servir le fichier HTML et les fichiers statiques (CSS)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
