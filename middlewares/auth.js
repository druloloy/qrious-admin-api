const { verifyAccessToken } = require('../helpers/tokenizer');
const Exception = require('../helpers/Exception');
const Admin = require('../models/Admin.model');

exports.auth = async (req, _res, next) => {
    try {
        const token =
            req.headers.authorization &&
            req.headers.authorization.split(' ')[1];

        if (!token) return next(new Exception('Please login again.', 401));
        const admin = verifyAccessToken(token);

        if (!admin) return next(new Exception('Please login again.', 401));

        req.user = admin;
        next();
    } catch (error) {
        return next(new Exception('Please login again.', 401));
    }
};

exports.forMaster = async (req, _res, next) => {
    try {
        if (req.user.role !== 'master') {
            return next(new Exception('You are not authorized', 403));
        }
        const password = req.body.password;
        if (!password)
            return next(new Exception('Please provide password', 400));

        const admin = await Admin.findOne({ inst_id: req.user.inst_id });
        if (!admin) return next(new Exception('Admin not found', 404));

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return next(new Exception('Password is incorrect', 400));

        // continue
        next();
    } catch (error) {
        return next(new Exception('Please login again.', 401));
    }
};
