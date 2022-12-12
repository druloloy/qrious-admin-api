const { sign, verify, decode } = require('jsonwebtoken');
const access_key = process.env.ADMIN_ACCESS_SECRET;
const session_key = process.env.ADMIN_SESSION_SECRET;

const sessionExpiration = '1d';
const accessExpiration = '1m';
const sessionOptions = {
    expiresIn: sessionExpiration,
    issuer: 'qrious-api',
    subject: 'qrious-session',
    audience: 'qrious-admin',
};
const accessOptions = {
    expiresIn: accessExpiration,
    issuer: 'qrious-api',
    subject: 'qrious-access',
    audience: 'qrious-admin',
};

// Session token creation
const createSessionToken = (id, inst_id, role) => {
    const payload = {
        id,
        inst_id,
        role,
    };
    return sign(payload, session_key, sessionOptions);
};

// Session token verification
const verifySessionToken = (token) => {
    return verify(token, session_key, sessionOptions);
};

// Session token decode, returns payload
const decodeSessionToken = (token) => {
    return decode(token, { complete: true, json: true });
};

// Access token creation
const createAccessToken = (id, inst_id, role) => {
    const payload = {
        id,
        inst_id,
        role,
    };
    return sign(payload, access_key, accessOptions);
};

// Access token verification
const verifyAccessToken = (token) => {
    return verify(token, access_key, accessOptions);
};

// Access token decode, returns payload
const decodeAccessToken = (token) => {
    return decode(token, { complete: true, json: true });
};

module.exports = {
    createSessionToken,
    verifySessionToken,
    decodeSessionToken,
    createAccessToken,
    verifyAccessToken,
    decodeAccessToken,
};
