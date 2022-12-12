const mongoose = require('mongoose');
const FileMetadataSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        authors: {
            type: [String],
            required: false,
            default: [],
        },
        year: {
            type: Number,
            required: false,
        },
        publisher: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        tags: {
            type: [String],
            required: false,
            default: [],
        },
        fileName: {
            type: String,
            required: true,
        },
        /** used for uniqueness in aws bucket */
        versionId: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        uploader: {
            type: String,
            required: true,
        },
        hash: {
            type: String,
            required: true,
            unique: true,
        },
        key: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

FileMetadataSchema.methods.toJSON = function () {
    const fileMetadata = this;
    const fileMetadataObject = fileMetadata.toObject();
    delete fileMetadataObject.key;
    return fileMetadataObject;
};

const FileMetadata = mongoose.model('FileMetadata', FileMetadataSchema);
module.exports = FileMetadata;
