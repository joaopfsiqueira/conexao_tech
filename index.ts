import S3Demand from './TS/demand';
import S3Stream from './TS/stream';
import * as dotenv from 'dotenv';

dotenv.config();
const runExample = async () => {
	const filePath = './TS/359594.txt';
	const key = '359594.txt';
	const downloadPath = './359594.txt';

	// const s3Demand = new S3Demand();
	// await s3Demand.uploadFile(filePath, process.env.AMAZON_S3_BUCKET, key);
	// await s3Demand.downloadFile(process.env.AMAZON_S3_BUCKET, key, downloadPath);

	const s3Stream = new S3Stream();
	await s3Stream.uploadFileStream(filePath, process.env.AMAZON_S3_BUCKET, key);
	await s3Stream.downloadFileStream(process.env.AMAZON_S3_BUCKET, key, downloadPath);
};

runExample();
