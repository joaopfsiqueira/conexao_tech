declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly AMAZON_KEY: string;
			readonly AMAZON_SECRET: string;
			readonly AMAZON_REGION: string;
			readonly AMAZON_S3_BUCKET: string;
			readonly MONGO_URI: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
