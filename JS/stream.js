const AWS = require('aws-sdk');
const fs = require('fs');
const { Transform } = require('stream');
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const { insertBatchToMongo } = require('./config/mongo-connection');

const uploadFileStream = async (filePath, bucketName, key) => {
	const fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
	const params = {
		Bucket: bucketName,
		Key: key,
		Body: fileStream,
	};
	await s3.upload(params).promise();
};

const downloadFileStream = async (bucketName, key) => {
	const params = {
		Bucket: bucketName,
		Key: key,
	};

	let batchBuffer = [];
	const maxBatchSize = 10000;

	console.time('Iniciando download e processamento por Stream');
	const s3Stream = s3.getObject(params).createReadStream({ highWaterMark: 256 * 1024 });

	const transformStream = new Transform({
		async transform(chunk, encoding, callback) {
			const lines = chunk.toString().split('\n');
			for (const line of lines) {
				if (line.trim()) {
					batchBuffer.push(processLine(line));

					if (batchBuffer.length >= maxBatchSize) {
						await insertBatchToMongo(batchBuffer).then(() => {
							batchBuffer = [];
						});
					}
				}
			}
			callback();
		},
	});

	s3Stream.pipe(transformStream).on('finish', async () => {
		if (batchBuffer.length > 0) {
			await insertBatchToMongo(batchBuffer);
		}
		console.log('Download e processamento concluídos!');
		console.timeEnd('Iniciando download e processamento por Stream');
	});
	s3Stream.on('error', (err) => {
		console.error('Erro no download:', err);
	});
};

const processLine = (line) => {
	const [email, info1, info2, name, id, code, link1, link2, whatsapp, type, status] = line.split(';');
	// Monta o objeto que será inserido no MongoDB
	return {
		email,
		info1,
		info2,
		name,
		id,
		code,
		links: { link1, link2 },
		whatsapp,
		type,
		status,
		createdAt: new Date(),
	};
};

(async () => {
	// await uploadFileStream('./JS/359594.txt', 'pointer-email-archive-dev', '359594.txt');
	await downloadFileStream('pointer-email-archive-dev', '359594.txt');
})();
