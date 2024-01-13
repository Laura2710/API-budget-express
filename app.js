const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const envelopes = require('./utils/envelopes'); // Le chemin vers votre module envelopes.js
const { convertToNumber, convertToString } = require('./utils/helpers');

// Middleware pour analyser les données JSON dans le corps de la requête
app.use(bodyParser.json());

// Middleware pour analyser les données encodées dans l'URL
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de journalisation des requêtes
app.use(morgan('tiny'));

// Middleware pour servir des fichiers statiques depuis le répertoire 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil et la liste des enveloppes
app.get(['/', '/envelopes'], (req, res) => {
    try {
        const envelopesData = envelopes.getAll();
        res.json({ 'envelopes': envelopesData });
    } catch (error) {
        res.status(500).send('Une erreur interne est survenue.');
    }
});

// Route pour la création d'une nouvelle enveloppe budgétaire
app.post('/envelopes', (req, res) => {
    try {
        const name = convertToString(req.body['budget-name']);
        const initialAmount = convertToNumber(req.body['initial-amount']);
        const balance = convertToNumber(req.body['current-balance']);

        if (name && initialAmount && balance) {
            envelopes.addEnvelope(name, initialAmount, balance);
            res.redirect('/');
        } else {
            res.status(400).send('Les données fournies sont incorrectes.');
        }
    } catch (error) {
        res.status(500).send('Une erreur interne est survenue.');
    }
});

// Route pour obtenir les détails d'une enveloppe spécifique
app.get('/envelopes/:id', (req, res) => {
    try {
        const idEnvelope = convertToNumber(req.params.id);
        if (!idEnvelope) {
            return res.status(400).send('L\'ID de l\'enveloppe est invalide.');
        }

        const envelope = envelopes.getEnvelopeById(idEnvelope);
        if (!envelope) {
            return res.status(404).send('Enveloppe non trouvée.');
        }

        res.json({ 'envelope': envelope });
    } catch (error) {
        res.status(500).send('Une erreur interne est survenue.');
    }
});

// Route pour supprimer une enveloppe spécifique
app.delete('/envelopes/:id', (req, res) => {
    try {
        const idEnvelope = convertToNumber(req.params.id);
        if (!idEnvelope) {
            return res.status(400).send('L\'ID de l\'enveloppe est invalide.');
        }

        const deleted = envelopes.deleteEnvelope(idEnvelope);
        if (!deleted) {
            return res.status(404).send('Enveloppe non trouvée.');
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).send('Une erreur interne est survenue.');
    }
});

// Route pour mettre à jour une enveloppe spécifique
app.put('/envelopes/:id', (req, res) => {
    try {
        const idEnvelope = convertToNumber(req.params.id);
        if (!idEnvelope) {
            return res.status(400).send('L\'ID de l\'enveloppe est invalide.');
        }

        const updatedData = req.body; // Récupérez les données mises à jour à partir du corps de la requête
        console.log(updatedData);

        // Vérifiez si updatedData est vide
        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).send("Les données mises à jour sont vides.");
        }

        const envelopeToUpdate = envelopes.getEnvelopeById(idEnvelope);

        if (!envelopeToUpdate) {
            return res.status(404).send('Enveloppe non trouvée.');
        }

        envelopes.updateEnvelope(idEnvelope, updatedData);
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Une erreur interne est survenue.');
    }
});

app.post('/envelopes/transfer', (req, res) => {
    try {
        const source = convertToNumber(req.body['source-envelope']);
        const destination = convertToNumber(req.body['destination-envelope']);
        const transferAmount = convertToNumber(req.body['transfer-amount']);

        if (source !== destination) {
            if (isNaN(source) || isNaN(destination) || isNaN(transferAmount)) {
                throw new Error("Les données fournies sont incorrectes.");
            }

            const sourceEnvelope = envelopes.getEnvelopeById(source);
            const destinationEnvelope = envelopes.getEnvelopeById(destination);

            if (!sourceEnvelope || !destinationEnvelope) {
                throw new Error("Enveloppe source ou destination non trouvée.");
            }

            if (!envelopes.checkBalance(source, transferAmount)) {
                throw new Error("Fonds insuffisants dans l'enveloppe source.");
            }

            envelopes.updateBalance(source, destination, transferAmount);
            res.redirect('/');
        } else {
            throw new Error("L'enveloppe source et la destination ne peuvent pas être les mêmes.");
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});


// Écoute sur le port 8000
app.listen(8000, () => {
    console.log('Serveur en cours d\'exécution sur http://localhost:8000');
});
