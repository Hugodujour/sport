const axios = require('axios');
const cheerio = require('cheerio');

class Person {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

const Hugo = new Person('Hugo', 139605772);
const Valentin = new Person('Valentin', 100400572);
const Dakoona = new Person('Clément', 147668769);

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
    const duree = $('div.ProfileEveryone_metrics__wnvzB .Stat_statValue__3_kAe').last().text().slice(0, -3).replace(":", "h");

    return { name: person.name, distanceText, profileImage, duree };
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    const results = await Promise.all(people.map(person => getDistanceData(person)));
    res.json(results.filter(result => result !== null));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  }
};
