const Exception = require('../helpers/Exception');

const checkNulls = (user) => {
    const { inst_id, firstName, lastName, email, birthdate } = user;

    if (!inst_id || !firstName || !lastName || !email || !birthdate) {
        throw new Exception('Please fill out all fields.', 400);
    }

    return user;
};

const checkEmail = (email) => {
    // is email valid?
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
        throw new Exception('Invalid email.', 400);
    }

    const ALLOWED_EMAIL_DOMAINS = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
    ];
    const emailDomain = email.split('@')[1];

    if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
        throw new Exception('Please use a valid email address.', 400);
    }

    return email;
};

const checkPassword = (password) => {
    const [minLength, maxLength] = [8, 120];
    if (password.length > maxLength || password.length < minLength) {
        return new Exception(
            'Password must be between 12 and 120 characters.',
            400
        );
    }
    return password;
};

const checkInstId = (inst_id) => {
    const instIdPattern = /[1-9][0-9]-\d{5}/;
    if (!instIdPattern.test(inst_id)) {
        throw new Exception(
            'Invalid institution ID. Please use the format: 00-00000',
            400
        );
    }
    return inst_id;
};

const checkSuffix = (suffix) => {
    if (suffix && suffix.length > 3) {
        throw new Exception('Suffix must be 3 characters or less.', 400);
    }
    return suffix;
};

const transform = (user) => {
    const { firstName, middleName, lastName, suffix, email } = user;

    // transform to lowercase
    const transformedUser = {
        firstName: firstName.toLowerCase(),
        middleName: middleName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        suffix: suffix && suffix.toLowerCase(),
        email: email.toLowerCase(),
    };
    return transformedUser;
};

class Sanitizer {
    static checkInstId(req, _res, next) {
        try {
            checkInstId(req.inst_id);
        } catch (error) {
            next(error);
        }
    }
    static invoke(req, _res, next) {
        try {
            const { inst_id, suffix, email, password } = req.body;

            req.body = Object.assign(req.body, checkNulls(req.body));
            req.body.email = checkEmail(email);
            req.body.inst_id = checkInstId(inst_id);
            req.body.suffix = checkSuffix(suffix);
            req.body.password = checkPassword(password);
            req.body = Object.assign(req.body, transform(req.body));

            next();
        } catch (error) {
            next(error);
        }
    }
}

class ParamSanitizer {
    static checkInstId(req, _res, next) {
        try {
            checkInstId(req.params.id);
            next();
        } catch (error) {
            next(error);
        }
    }
}

class QuerySanitizer {
    static checkInstId(req, _res, next) {
        try {
            checkInstId(req.query.id);
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = { Sanitizer, ParamSanitizer, QuerySanitizer };
