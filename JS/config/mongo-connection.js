const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);

const insertBatchToMongo = async (batch) => {
	try {
		await client.connect();
		const db = client.db('test');
		const collection = db.collection('messages');
		await collection.insertMany(batch);
		console.log(`Inseriu ${batch.length} registros no MongoDB`);
	} finally {
		await client.close();
	}
};

module.exports = { insertBatchToMongo };
