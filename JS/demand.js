require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const uploadFile = async (filePath, bucketName, key) => {
	try {
		console.time('Upload Tradicional');
		const fileContent = fs.readFileSync(filePath);
		const params = {
			Bucket: bucketName,
			Key: key,
			Body: fileContent,
		};
		await s3.upload(params).promise();
		console.timeEnd('Upload Tradicional');
	} catch (err) {
		console.error('Erro no upload:', err);
	}
};

const downloadFile = async (bucketName, key, downloadPath) => {
	try {
		console.time('Download Tradicional');
		const params = {
			Bucket: bucketName,
			Key: key,
		};
		const data = await s3.getObject(params).promise();
		fs.writeFileSync(downloadPath, data.Body);
		console.timeEnd('Download Tradicional');
	} catch (err) {
		console.error('Erro no download:', err);
	}
};

uploadFile('./JS/359594.txt', process.env.AMAZON_S3_BUCKET, '359594.txt').then(() => {
	downloadFile(process.env.AMAZON_S3_BUCKET, '359594.txt', './359594.txt');
});
