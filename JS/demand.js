require('dotenv').config();
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});
const { Transform } = require('stream');
const { insertBatchToMongo } = require('./config/mongo-connection');

const uploadFile = async (filePath, bucketName, key) => {
	try {
		const fileContent = fs.readFileSync(filePath);
		const params = {
			Bucket: bucketName,
			Key: key,
			Body: fileContent,
		};
		await s3.upload(params).promise();
	} catch (err) {
		console.error('Erro no upload:', err);
	}
};

const downloadFile = async (bucketName, key) => {
	const downloadPath = path.join(__dirname, 'temp', key);
	try {
		console.time('Download Tradicional');
		const params = {
			Bucket: bucketName,
			Key: key,
		};
		const data = await s3.getObject(params).promise();
		fs.writeFileSync(downloadPath, data.Body);
		console.timeEnd('Download Tradicional');
		console.log(`Arquivo salvo em ${downloadPath}`);
		return downloadPath;
	} catch (err) {
		console.error('Erro no download:', err);
		return null;
	}
};

const processFileStream = (filePath) => {
	const readStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
	let batchBuffer = [];
	const maxBatchSize = 10000;

	console.time('Iniciando processamento por Stream Local');

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

	readStream.pipe(transformStream).on('finish', async () => {
		if (batchBuffer.length > 0) {
			await insertBatchToMongo(batchBuffer);
		}
		console.log('Processamento do arquivo concluído.');
		console.timeEnd('Iniciando processamento por Stream Local');
	});

	readStream.on('error', (err) => {
		console.error('Erro na leitura do arquivo:', err);
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
	// await uploadFile('./JS/359594.txt', process.env.AMAZON_S3_BUCKET, '359594.txt');
	const filePath = await downloadFile(process.env.AMAZON_S3_BUCKET, '359594.txt');
	if (filePath) {
		processFileStream(filePath);
	}
})();
