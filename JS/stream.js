const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const uploadFileStream = (filePath, bucketName, key) => {
	const fileStream = fs.createReadStream(filePath);
	const params = {
		Bucket: bucketName,
		Key: key,
		Body: fileStream,
	};
	return s3.upload(params).promise(); // Faz upload por stream
};

const downloadFileStream = (bucketName, key, downloadPath) => {
	const params = {
		Bucket: bucketName,
		Key: key,
	};
	const fileStream = fs.createWriteStream(downloadPath);
	return new Promise((resolve, reject) => {
		s3.getObject(params)
			.createReadStream() // Faz download por stream
			.pipe(fileStream)
			.on('finish', () => {
				console.log('Download completo!');
				resolve();
			})
			.on('error', (err) => {
				console.error('Erro no download:', err);
				reject(err);
			});
	});
};

uploadFileStream('./JS/359594.txt', process.env.AMAZON_S3_BUCKET, '359594.txt').then(() => {
	downloadFileStream(process.env.AMAZON_S3_BUCKET, '359594.txt', './359594.txt');
});
