const crypto = require('crypto');

// checksum using md5 hash
exports.checksum = (data) => {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
};

exports.compareChecksum = (data, checksum) => {
    return this.checksum(data) === checksum;
};
