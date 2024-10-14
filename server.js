const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Classe Person pour définir les utilisateurs
class Person {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

// Liste des personnes
const Hugo = new Person('Hugo', 139605772);
const Valentin = new Person('Valentin', 100400572);
const Dakoona = new Person('Clément', 147668769);

const people = [Hugo, Valentin, Dakoona];

// Fonction pour récupérer les données Strava d'un utilisateur
const getDistanceData = async (person) => {
    try {
        const { data } = await axios.get(`https://www.strava.com/athletes/${person.id}`);
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

// API locale pour récupérer les utilisateurs et leurs données
app.get('/api/users', async (req, res) => {
    try {
        const results = await Promise.all(people.map(person => getDistanceData(person)));
        res.json(results.filter(result => result !== null));
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    }
});

// Servir les fichiers du frontend (index.html, style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
