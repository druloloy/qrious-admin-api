const crypto = require('crypto');

const aesOptions = {
    algorithm: 'aes-128-cbc',
    key: Buffer.from(process.env.AES_128CBC_KEY, 'base64url'),
    iv: Buffer.from(process.env.AES_128CBC_IV, 'base64url'),
};

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let encrypted = cipher.update(text, 'utf-8', 'base64url');
    return (encrypted += cipher.final('base64url'));
};

const decrypt = (text) => {
    const decipher = crypto.createDecipheriv(
        aesOptions.algorithm,
        aesOptions.key,
        aesOptions.iv
    );
    let decrypted = decipher.update(text, 'base64url', 'utf-8');
    return (decrypted += decipher.final('utf-8'));
};

module.exports = aes = {
    encrypt,
    decrypt,
};
