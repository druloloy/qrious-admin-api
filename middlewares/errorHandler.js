const Exception = require('../helpers/Exception');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;

    process.env.NODE_ENV === 'development' ? console.log(err) : null;

    if (err.name === 'CastError') {
        console.log(err);
        const message = 'Address not found!';
        error = new Exception(message, 404);
    }

    // Mongoose validation error for duplicate unique fields
    if (err.code === 11000) {
        const notUnique = Object.keys(err.keyValue);
        if (notUnique.includes('hash')) {
            const message =
                'File with similar hash exists, this file is a duplicate!';
            error = new Exception(message, 400);
        } else {
            const message = `Please provide a unique information for ${notUnique[0]}.`;
            error = new Exception(message, 400);
        }
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new Exception(message, 400);
    }
    if (err.name === 'TypeError') {
        const message = 'Search not found.';
        console.log(err);
        error = new Exception(message, 404);
    }

    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
        const message = 'Access token has expired or is invalid!';
        error = new Exception(message, 403);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error.',
    });
};

module.exports = errorHandler;
