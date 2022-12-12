const aws = require('aws-sdk');

const bucketName = process.env.AWS_S3_BUCKET || 'qrious-files';
const s3 = new aws.S3();

const addFile = async (file, callback) => {
    const params = {
        Bucket: bucketName,
        Key: file.name,
        Body: file.data,
        ContentLength: file.data.length,
        ContentType: file.type || 'application/pdf',
    };
    await s3.upload(params).promise().then(callback);
};

const updateFile = async (file, callback) => {
    const params = {
        Bucket: bucketName,
        Key: file.name,
        Body: file.data,
        ContentLength: file.data.length,
        ContentType: file.type || 'application/pdf',
    };
    s3.putObject(params, callback);
};

const getFile = async (file, callback) => {
    const params = {
        Bucket: bucketName,
        Key: file.name,
        VersionId: file.versionId,
    };
    await s3.getObject(params).promise().then(callback);
};

const deleteFile = async (fileName, callback) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };
    await s3.deleteObject(params).promise().then(callback);
};

// https://stackoverflow.com/a/58756827
const getAllFiles = async () => {
    let list = [];
    let shouldContinue = true;
    let nextContinuationToken = null;
    while (shouldContinue) {
        let res = await s3
            .listObjectsV2({
                Bucket: bucketName,
                ContinuationToken: nextContinuationToken || undefined,
            })
            .promise();
        list = [...list, ...res.Contents];

        if (!res.IsTruncated) {
            shouldContinue = false;
            nextContinuationToken = null;
        } else {
            nextContinuationToken = res.NextContinuationToken;
        }
    }
    return list;
};

// (async () => {
// const file = {
//     name: 'test1111.txt',
//     data: Buffer.from('hello world!'),
//     type: 'text/plain',
// };
// addFile(file, (res, err) => {
//     if (err) console.log(err);
//     else console.log(res);
// });
//     const files = await getAllFiles();
//     console.log(files);
// })();

/**
 *  node ./helpers/s3/s3.js
    {
    IsTruncated: true,
    Contents: [
        {
        Key: 'test.txt',
        LastModified: 2022-09-12T01:07:13.000Z,
        ETag: '"fc3ff98e8c6a0d3087d515c0473f8677"',
        ChecksumAlgorithm: [],
        Size: 12,
        StorageClass: 'STANDARD'
        }
    ],
    Name: 'qrious-files',
    Prefix: '',
    MaxKeys: 1,
    CommonPrefixes: [],
    KeyCount: 1,
    NextContinuationToken: '1KA9VYXBGBad+4P2c3qTG4+tAL3Oqi9VDNCSMYbcRnS91hRJBscbFgg=='
    }
 */

module.exports = {
    addFile,
    updateFile,
    getFile,
    deleteFile,
    getAllFiles,
};
