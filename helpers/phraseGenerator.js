const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

module.exports = async function (length) {
    const phrase = [];

    let wordList = await fs.readFile(
        path.join(__dirname, '../', 'eff_large_wordlist.txt'),
        'utf8'
    );

    wordList = wordList.split('\n');

    const listLength = wordList.length;
    for (let i = 0; i < length; i++) {
        // generate random index
        const randomIndex = crypto.randomInt(listLength - 1);
        // get random word
        const randomWord = wordList[randomIndex];
        // add word to phrase
        phrase.push(randomWord);
    }
    return phrase;
};
