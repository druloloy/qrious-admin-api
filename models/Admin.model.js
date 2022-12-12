const mongoose = require('mongoose');
const { comparePhrase } = require('../helpers/dictionary/phraser');
const {
    createSessionToken,
    createAccessToken,
} = require('../helpers/tokenizer');

const { hash, compare } = require('bcryptjs');
const Exception = require('../helpers/Exception');

const Admin = mongoose.Schema(
    {
        inst_id: {
            type: String,
            required: true,
            unique: true,
        },
        // roles can be master and worker
        role: {
            type: String,
            required: true,
            enum: ['master', 'worker'],
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
        recovery_phrase: {
            type: Array,
            required: true,
        },
        sessionToken: {
            type: Array,
            required: false,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

Admin.methods.comparePassword = async function (password) {
    return await compare(password, this.password);
};

Admin.methods.createSessionToken = function () {
    try {
        const token = createSessionToken(this.id, this.inst_id, this.role);
        this.sessionToken = [token];
        return token;
    } catch (error) {
        throw error;
    }
};

Admin.methods.compareSessionToken = function (token) {
    try {
        return this.sessionToken[0] === token;
    } catch (error) {
        throw error;
    }
};

Admin.methods.removeSession = function () {
    this.sessionToken = [];
};

Admin.methods.createAccessToken = function () {
    try {
        const token = createAccessToken(this.id, this.inst_id, this.role);
        return token;
    } catch (error) {
        throw error;
    }
};

Admin.methods.compareRecoveryPhrase = function (phrase) {
    try {
        const recoveryPhrase = this.recovery_phrase[0];
        return comparePhrase(phrase, recoveryPhrase);
    } catch (error) {
        throw error;
    }
};

Admin.pre('save', async function (next) {
    // if password not changed, continue
    if (!this.isModified('password')) return next();

    // hash password
    this.password = await hash(this.password, 12);
    next();
});

module.exports = mongoose.model('Admin', Admin);
