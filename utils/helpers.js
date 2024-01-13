const convertToNumber = (input) => {
    const parsedNumber = parseFloat(input); // Utilisez parseFloat pour convertir en nombre décimal (à virgule flottante)
    if (!isNaN(parsedNumber)) {
        return parsedNumber;
    } else {
        return false;
    }
}

function convertToString(input) {
    if (typeof input === 'string') {
        return input;
    } else if (typeof input === 'number') {
        return input.toString();
    } else {
        return false;
    }
}

module.exports = { convertToNumber, convertToString };

