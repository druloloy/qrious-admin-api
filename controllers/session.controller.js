const { verifySessionToken } = require('../helpers/tokenizer');
const Exception = require('../helpers/Exception');
const Admin = require('../models/Admin.model');
const { getms } = require('../helpers/shortdate/shortdate');

exports.refreshAccessToken = async (req, res, next) => {
    try {
        const sessionToken = req.cookies._s;

        if (!sessionToken) {
            return next(new Exception('Please login again.', 400));
        }

        const decoded = verifySessionToken(sessionToken);
        const { id, inst_id, role } = decoded;

        // check user exists
        const user = await Admin.findOne({
            _id: id,
            inst_id,
            role,
        });

        if (!user) {
            return next(new Exception('Please login again.', 400));
        }

        if (user.compareSessionToken(sessionToken)) {
            return next(new Exception('Please login again.', 400));
        }

        const accessToken = user.createAccessToken();

        return res.status(200).json({
            message: 'Access token refreshed',
            token: accessToken,
        });
    } catch (err) {
        console.log(err);
        return next(new Exception('Please login again.', 500));
    }
};
