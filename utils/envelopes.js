const fs = require('fs');
const path = require('path');

const envelopesFilePath = path.join(__dirname, 'envelopes.json');

const getAll = () => {
    const envelopesData = fs.readFileSync(envelopesFilePath, 'utf-8');
    return JSON.parse(envelopesData);
}

const addEnvelope = (name, amount, balance) => {
    const envelopes = getAll();

    // Trouver le dernier ID existant
    let lastId = 0;
    for (const envelope of envelopes) {
        if (envelope.id > lastId) {
            lastId = envelope.id;
        }
    }

    // Créer une nouvelle enveloppe avec un nouvel ID
    const newEnvelope = {
        id: lastId + 1,
        nom: name,
        montant_initial: parseFloat(amount),
        solde_actuel: parseFloat(balance)
    };

    // Ajouter la nouvelle enveloppe à la liste actuelle
    envelopes.push(newEnvelope);

    // Écrire la liste mise à jour dans le fichier JSON
    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
}

const deleteEnvelope = (id) => {
    const envelopes = getAll();
    const envelopeIndex = envelopes.findIndex(envelope => envelope.id === id);

    if (envelopeIndex !== -1) {
        envelopes.splice(envelopeIndex, 1);
        fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
        console.log(`Enveloppe avec ID ${id} supprimée avec succès.`);
        return true;
    } else {
        console.error(`Enveloppe avec ID ${id} non trouvée.`);
        return false
    }
}

const getEnvelopeById = (id) => {
    const envelopes = getAll();
    return envelopes.find(envelope => envelope.id === id);
}

const updateEnvelope = (id, updatedData) => {
    const envelopes = getAll();
    const envelopeToUpdate = envelopes.find(envelope => envelope.id === id);

    if (!envelopeToUpdate) {
        console.error(`Enveloppe avec ID ${id} non trouvée.`);
        return false; // Retourne false si l'enveloppe n'est pas trouvée
    }

    console.log(updatedData.montant_initial, updatedData.solde_actuel)
    console.log("a updaté : " + envelopeToUpdate)

    // Mettez à jour les propriétés de l'enveloppe avec les nouvelles données
    envelopeToUpdate.montant_initial = parseFloat(updatedData.montant_initial);
    envelopeToUpdate.solde_actuel = parseFloat(updatedData.solde_actuel);

    // Enregistrez les enveloppes mises à jour dans le fichier JSON
    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');

    console.log(`Enveloppe avec ID ${id} mise à jour avec succès.`);
    return true; // Retourne true pour indiquer que la mise à jour a réussi
}

const checkBalance = (source, transfer) => {
    const envelope = getEnvelopeById(source);
    let totalAfterTransfer = envelope.montant_initial - transfer;
    if (totalAfterTransfer > 0) {
        return true
    }
    else {
        return false
    }
}

const updateBalance = (source, destination, transferAmount) => {
    const envelopes = getAll();
    const envelopeSourceToUpdate = envelopes.find(envelope => envelope.id === source);
    const envelopeDestinationToUpdate = envelopes.find(envelope => envelope.id === destination);

    if (!envelopeSourceToUpdate || !envelopeDestinationToUpdate) {
        console.error(`Enveloppe avec ID ${source} ou ${destination} non trouvée.`);
        return false; // Retourne false si l'une des enveloppes n'est pas trouvée
    }

    if (envelopeSourceToUpdate.solde_actuel < transferAmount) {
        console.error(`Fonds insuffisants dans l'enveloppe source avec ID ${source}.`);
        return false; // Retourne false si les fonds sont insuffisants dans l'enveloppe source
    }

    envelopeSourceToUpdate.solde_actuel -= transferAmount;
    envelopeDestinationToUpdate.solde_actuel += transferAmount;

    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
    return true;
}

module.exports = {
    getAll,
    addEnvelope,
    deleteEnvelope,
    getEnvelopeById,
    updateEnvelope,
    checkBalance,
    updateBalance
}
