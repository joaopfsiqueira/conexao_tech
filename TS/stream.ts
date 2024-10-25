import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export interface IS3Stream {
	uploadFileStream(filePath: string, bucketName: string, key: string): Promise<void>;
	downloadFileStream(bucketName: string, key: string, downloadPath: string): Promise<void>;
}

class S3Stream implements IS3Stream {
	private s3: AWS.S3;

	constructor() {
		this.s3 = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION,
		});
	}

	public async uploadFileStream(filePath: string, bucketName: string, key: string): Promise<void> {
		try {
			const fileStream = fs.createReadStream(filePath);
			const params: AWS.S3.PutObjectRequest = {
				Bucket: bucketName,
				Key: key,
				Body: fileStream,
			};
			const data = await this.s3.upload(params).promise();
			console.log(`Arquivo enviado com sucesso: ${data.Location}`);
		} catch (err) {
			console.error('Erro no upload:', err);
		}
	}

	public async downloadFileStream(bucketName: string, key: string, downloadPath: string): Promise<void> {
		try {
			const params: AWS.S3.GetObjectRequest = {
				Bucket: bucketName,
				Key: key,
			};
			const fileStream = fs.createWriteStream(downloadPath);
			return new Promise<void>((resolve, reject) => {
				this.s3
					.getObject(params)
					.createReadStream()
					.pipe(fileStream)
					.on('finish', () => {
						console.log(`Arquivo baixado com sucesso: ${path.resolve(downloadPath)}`);
						resolve();
					})
					.on('error', (err) => {
						console.error('Erro no download:', err);
						reject(err);
					});
			});
		} catch (err) {
			console.error('Erro no download:', err);
		}
	}
}

export default S3Stream;
