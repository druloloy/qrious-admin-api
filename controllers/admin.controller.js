const Admin = require('../models/Admin.model');
const Exception = require('../helpers/Exception');
const passgen = require('../helpers/passgen');
const Dictionary = require('../helpers/dictionary/phraser');
const { deactivateGenesis } = require('../db/genesis');
const mailer = require('../mail/mailer');
const { getms } = require('../helpers/shortdate/shortdate');

const recoveryPhraseLength = 15;

exports.signup = async (req, res, next) => {
    try {
        const {
            inst_id,
            role,
            firstName,
            middleName,
            lastName,
            suffix,
            email,
        } = req.body;

        // check if user exists
        const userExists = await Admin.findOne({ inst_id, email });
        if (userExists) return next(new Exception('User already exists.', 400));

        // create password
        const password = await passgen();
        console.log(password);
        // create recovery phrase
        const recoveryPhrase =
            Dictionary.getInstance().getPhrase(recoveryPhraseLength);

        // create new user
        const admin = await Admin.create({
            inst_id,
            role,
            firstName,
            middleName,
            lastName,
            suffix,
            email,
            password,
            recovery_phrase: recoveryPhrase,
        });

        // create session token
        // const token = await admin.createSession();
        // res.cookie('session', token);

        // save user
        await admin.save();

        // deactivate genesis
        deactivateGenesis();

        const adminObj = admin.toObject();
        delete adminObj.password;
        delete adminObj.sessionToken;

        // send password to email
        await mailer.sendUser_Password({ to: admin.email, password }, (err) => {
            if (err) throw err;
            res.status(200).json({
                message:
                    'Please check the email associated with this account for your password.',
                recovery_phrase: recoveryPhrase,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { inst_id, password } = req.body;

        if (!inst_id || !password)
            throw new Exception('Please provide all required fields.', 400);

        const admin = await Admin.findOne({ inst_id });

        if (!admin)
            return next(new Exception('The id or password is incorrect.', 400));

        if (!admin.active)
            return next(
                new Exception(
                    'The account associated to this information is already deactivated.',
                    400
                )
            );

        const isMatch = await admin.comparePassword(password);

        if (!isMatch)
            return next(new Exception('The id or password is incorrect.', 400));

        // create session token
        const session_token = admin.createSessionToken();

        // create access token
        const access_token = admin.createAccessToken();

        res.cookie('_s', session_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: getms('1d'), // 1d expiration
        });

        const adminObj = admin.toObject();
        delete adminObj.password;
        delete adminObj.recovery_phrase;
        delete adminObj.sessionToken;

        res.status(200).json({
            message: `Welcome back, ${admin.firstName}!`,
            admin: adminObj,
            token: access_token,
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('User not found.', 404));

        admin.removeSession();
        await admin.save();

        res.clearCookie('_s');
        res.status(200).json({
            message: 'User logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.recover = async (req, res, next) => {
    try {
        const { recoveryPhrase } = req.body;
        const { inst_id } = req.query;

        const admin = await Admin.findOne({ inst_id });
        if (!admin) return next(new Exception('Admin not found.', 404));

        if (!admin.active)
            return next(
                new Exception(
                    'The account associated to this information is already deactivated.',
                    400
                )
            );

        const isMatch = Dictionary.comparePhrase(
            recoveryPhrase,
            admin.recovery_phrase
        );

        if (!isMatch)
            return next(new Exception('Recovery phrase is incorrect.', 400));

        // create password
        const password = await passgen();
        admin.password = password;
        // generate new recovery phrase
        const newRecoveryPhrase =
            Dictionary.getInstance().getPhrase(recoveryPhraseLength);
        admin.recovery_phrase = newRecoveryPhrase;
        await admin.save();

        await mailer.sendUser_Password({ to: admin.email, password }, (err) => {
            if (err) throw err;
            res.status(200).json({
                message:
                    'Password changed successfully. Please check the email associated with this account.',
                recovery_phrase: newRecoveryPhrase,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { id } = req.query;

        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('Admin not found.', 404));

        if (!admin.active) {
            return next(
                new Exception(
                    'The account associated to this information is already deactivated.',
                    400
                )
            );
        }

        const newRecoveryphrase =
            Dictionary.getInstance().getPhrase(recoveryPhraseLength);
        const newPassword = await passgen();

        admin.recovery_phrase = newRecoveryphrase;
        admin.password = newPassword;
        await admin.save();

        // send password to email
        await mailer.sendUser_Password(
            { to: admin.email, password: newPassword },
            (err) => {
                if (err) throw err;
                res.status(200).json({
                    message:
                        'Password changed successfully. Please check the email associated with this account.',
                    recovery_phrase: newRecoveryphrase,
                });
            }
        );
    } catch (error) {
        next(error);
    }
};

exports.changeMyPassword = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { password } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('Admin not found.', 404));

        const isMatch = await admin.comparePassword(password);

        if (!isMatch)
            return next(new Exception('The password is incorrect.', 400));

        const newPassword = await passgen();

        admin.password = newPassword;
        await admin.save();

        // send password to email
        await mailer.sendUser_Password(
            { to: admin.email, password: newPassword },
            (err) => {
                if (err) throw err;
                res.status(200).json({
                    message:
                        'Password changed successfully. Please check the email associated with this account.',
                });
            }
        );
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.query;

        const admin = await Admin.findById(id);
        3;
        if (!admin) return next(new Exception('Admin not found.', 404));

        const email = admin.email;

        await Admin.deleteOne(admin);

        // send email notice

        res.status(200).json({
            message: 'Admin removed successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.deactivate = async (req, res, next) => {
    try {
        const { id } = req.query;

        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('Admin not found.', 404));

        if (!admin.active)
            return next(new Exception('Admin is already deactivated.', 400));

        admin.active = false;
        await admin.save();

        // send email notice

        res.status(200).json({
            message: 'Admin deactivated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.activate = async (req, res, next) => {
    try {
        const { id } = req.query;

        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('Admin not found.', 404));

        if (admin.active)
            return next(new Exception('Admin is already activated.', 400));

        admin.active = true;
        await admin.save();

        // send email notice

        res.status(200).json({
            message: 'Admin activated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.changeRole = async (req, res, next) => {
    try {
        const { id } = req.query;
        const { role } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) return next(new Exception('Admin not found.', 404));

        admin.role = role;
        await admin.save();

        // send email notice
        res.status(200).json({
            message: 'Admin role changed successfully.',
        });
    } catch (error) {
        next(error);
    }
};
