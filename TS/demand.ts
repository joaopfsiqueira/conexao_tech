import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

export interface IS3Demand {
	uploadFile(filePath: string, bucketName: string, key: string): Promise<void>;
	downloadFile(bucketName: string, key: string, downloadPath: string): Promise<void>;
}

class S3Demand implements IS3Demand {
	private s3: AWS.S3;

	constructor() {
		this.s3 = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION,
		});
	}

	public async uploadFile(filePath: string, bucketName: string, key: string): Promise<void> {
		try {
			const fileContent = fs.readFileSync(filePath);
			const params: AWS.S3.PutObjectRequest = {
				Bucket: bucketName,
				Key: key,
				Body: fileContent,
			};
			const data = await this.s3.upload(params).promise();
			console.log(`Arquivo enviado com sucesso: ${data.Location}`);
		} catch (err) {
			console.error('Erro no upload:', err);
		}
	}

	public async downloadFile(bucketName: string, key: string, downloadPath: string): Promise<void> {
		try {
			const params: AWS.S3.GetObjectRequest = {
				Bucket: bucketName,
				Key: key,
			};
			const data = await this.s3.getObject(params).promise();
			fs.writeFileSync(downloadPath, data.Body as Buffer);
			console.log(`Arquivo baixado com sucesso: ${path.resolve(downloadPath)}`);
		} catch (err) {
			console.error('Erro no download:', err);
		}
	}
}

export default S3Demand;
