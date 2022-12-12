const Admin = require('../models/Admin.model');
const Exception = require('../helpers/Exception');

const defaultInstId = '00-00000';

const genesis_password = process.env.GENESIS_PASSWORD;
exports.createGenesis = async () => {
    try {
        const admin = await Admin.findOne({ inst_id: defaultInstId });
        if (!admin) {
            const genesis = await Admin.create({
                inst_id: defaultInstId,
                role: 'master',
                firstName: 'Admin',
                middleName: '',
                lastName: 'Genesis',
                suffix: '',
                email: 'admin@example.com',
                password: genesis_password,
            });
            genesis.password = genesis_password;
            await genesis.save();
        }
    } catch (error) {
        throw new Error(error);
    }
};

exports.deactivateGenesis = async () => {
    try {
        const admin = await Admin.findOne({ inst_id: defaultInstId });
        if (admin && admin.active) {
            admin.active = false;
            await admin.save();
        }
    } catch (error) {
        throw new Error(error);
    }
};
