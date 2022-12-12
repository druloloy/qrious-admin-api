const FileMetadata = require('../models/FileMetadata.model');
const s3 = require('../helpers/s3/s3');
const crypto = require('crypto');
const panda = require('panda-encryption').Panda;
const { checksum } = require('../helpers/checksum');
const aes = require('../helpers/aes');
const Exception = require('../helpers/exception');

const pandaConfig = {
    key: process.env.ENCRYPTION_KEY,
    seed: process.env.ENCRYPTION_SEED,
};

exports.uploadFile = async (req, res, next) => {
    try {
        const { title, authors, year, publisher, description, tags } = req.body;
        const { originalname, mimetype, size, buffer } = req.file;

        // generate key for encryption
        const generatedKey = crypto.randomBytes(32).toString('hex');
        pandaConfig.key = generatedKey;

        const encryptedBuffer = await panda.encrypt(buffer, pandaConfig);

        const fileChecksum = checksum(buffer);

        const fileDuplicate = await FileMetadata.findOne({
            hash: fileChecksum,
        });
        if (fileDuplicate) {
            next(
                new Exception(
                    'File with similar hash exists, this file is a duplicate! Please check ' +
                        fileDuplicate._id,
                    400
                )
            );
        }

        // tags to array
        const tagsArray = tags
            .split(',')
            .map((tag) => tag.trim().toLowerCase());

        // upload to s3
        const file = {
            name: originalname,
            type: mimetype,
            data: encryptedBuffer,
        };
        await s3.addFile(file, async (result, err) => {
            if (err) {
                throw err;
            }
            // save metadata
            const fileMetadata = new FileMetadata({
                title,
                fileName: originalname,
                type: mimetype,
                size: size,
                versionId: result.VersionId,
                path: result.Location,
                uploader: checksum(req.user.inst_id),
                authors,
                year,
                publisher,
                description,
                tags: tagsArray,
                hash: fileChecksum,
                key: aes.encrypt(generatedKey), // encrypt key before saving
            });
            await fileMetadata.save();

            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                metadata: fileMetadata,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getFileMetadata = async (req, res, next) => {
    try {
        const { id } = req.query;
        const fileMetadata = await FileMetadata.findById(id);
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }
        res.status(200).json({
            success: true,
            metadata: fileMetadata.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};
exports.viewFile = async (req, res, next) => {
    try {
        const { id } = req.query;
        const fileMetadata = await FileMetadata.findById(id).select('+key');
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }
        const key = aes.decrypt(fileMetadata.key);
        pandaConfig.key = key;

        const file = {
            name: fileMetadata.fileName,
            versionId: fileMetadata.versionId,
        };

        await s3.getFile(file, async (result, err) => {
            if (err) {
                throw err;
            }
            const decryptedBuffer = await panda.decrypt(
                result.Body,
                pandaConfig
            );
            res.status(200).json({
                success: true,
                buffer: decryptedBuffer,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllMetadata = async (req, res, next) => {
    try {
        const defaultOffset = 0;
        const defaultLimit = 10;

        const { offset, limit } = req.query;
        const fileMetadata = await FileMetadata.find()
            .skip(parseInt(offset) || defaultOffset)
            .limit(parseInt(limit) || defaultLimit);

        res.status(200).json({
            success: true,
            metadata: fileMetadata,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteFile = async (req, res, next) => {
    try {
        const { id } = req.query;
        const fileMetadata = await FileMetadata.findById(id);
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }

        const file = {
            name: fileMetadata.fileName,
            versionId: fileMetadata.versionId,
        };

        Promise.all([s3.deleteFile(file), fileMetadata.delete()]).then(() => {
            res.status(200).json({
                success: true,
                message: 'File deleted successfully',
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.downloadFile = async (req, res, next) => {
    try {
        const { id } = req.query;
        const fileMetadata = await FileMetadata.findById(id).select('+key');
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }
        const key = aes.decrypt(fileMetadata.key);
        pandaConfig.key = key;

        const file = {
            name: fileMetadata.fileName,
            versionId: fileMetadata.versionId,
        };

        await s3.getFile(file, async (result, err) => {
            if (err) {
                throw err;
            }
            const decryptedBuffer = await panda.decrypt(
                result.Body,
                pandaConfig
            );

            res.writeHead(200, [
                ['Content-Type', 'application/pdf'],
                [
                    'Content-Disposition',
                    'attachment; filename=' + fileMetadata.fileName,
                ],
            ]);
            res.end(decryptedBuffer);
        });
    } catch (error) {
        next(error);
    }
};
