if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerjsdoc = require('swagger-jsdoc');

const app = express();
const { createGenesis } = require('./db/genesis');

const corsConfig = require('./cors.config');
const Dictionary = require('./helpers/dictionary/phraser');
const { shortdatems } = require('./helpers/shortdate/shortdate');

// connect to database
require('./db/connect').connect();

// initialize dictionary
new Dictionary();
// InitializePassport(passport); // auth logic

const PORT = process.env.PORT || 5000;
const version = process.env.API_VERSION || 1;
app.use(helmet());
app.use(cors(corsConfig));
app.use(
    cookieParser(process.env.COOKIE_SECRET, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: shortdatems('1d'),
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    compression({
        level: 6,
        threshold: 1024, // 1kb
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        },
    })
);

// Routes
// api/[version]/[privilege: public|private]/
const properApiUri = `/api/v${version}`;

// initialize swagger jsdoc
app.use(
    properApiUri + '/docs',
    swaggerUi.serve,
    swaggerUi.setup(require('./swagger.config.json'), { explorer: true })
);

//  admin routes
app.use(`${properApiUri}/admin`, require('./routes/admin.route'));

// session route
app.use(`${properApiUri}/session`, require('./routes/session.route'));

// student route
app.use(`${properApiUri}/user`, require('./routes/user.route'));

// file route
app.use(`${properApiUri}/file`, require('./routes/filemetadata.route'));

// error handler
app.use(require('./middlewares/errorHandler'));

// create admin account
createGenesis();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/**
 * For handling unhandled rejections,
 * for additional security and debugging efficiency
 * @param {Error} err
 */
const rejectionHandler = (err) => {
    console.warn('Server timed out.');
    console.log(`ERROR LOG: ${err}`);

    /**Close the server if an error is unhandled. */
    server.close((_) => process.exit(1));
};

/**
 * For handling uncaught expection,
 * for additional security and debugging efficiency
 * @param {Error} err
 */
const exceptionHandler = (err) => {
    console.error('Unhandled exception.');
    console.error(err.stack);
};

process.on('uncaughtException', exceptionHandler);
process.on('unhandledRejection', rejectionHandler);
