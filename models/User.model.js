const mongoose = require('mongoose');
const { comparePhrase } = require('../helpers/dictionary/phraser');
const { createSessionToken } = require('../helpers/tokenizer');

const recoveryLength = 12;

const { hash, compare } = require('bcryptjs');
const Exception = require('../helpers/Exception');
const User = mongoose.Schema(
    {
        inst_id: {
            type: String,
            required: true,
            unique: true,
        },
        user_type: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        middleName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: true,
        },
        suffix: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        birthdate: {
            type: Date,
            required: true,
        },
        sessionToken: {
            type: Array,
            required: false,
        },
        recovery_phrase: {
            type: Array,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

User.methods.comparePassword = async function (password) {
    return await compare(password, this.password);
};
User.methods.createSession = function () {
    try {
        const token = createSessionToken(this.id, this.inst_id);
        this.sessionToken = [token];
        return token;
    } catch (error) {
        throw error;
    }
};

User.methods.removeSession = function () {
    this.sessionToken = [];
};

User.methods.compareRecoveryPhrase = function (phrase) {
    try {
        const recoveryPhrase = this.recovery_phrase[0];
        return comparePhrase(phrase, recoveryPhrase);
    } catch (error) {
        throw error;
    }
};

User.pre('save', async function (next) {
    // if password not changed, continue
    if (!this.isModified('password')) return next();

    // hash password
    this.password = await hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', User);
