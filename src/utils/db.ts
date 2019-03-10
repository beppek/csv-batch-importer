import * as mongoose from 'mongoose';

const { NODE_ENV } = process.env;

const DB_NAME = NODE_ENV === 'test' ? 'test-csv-import' : 'csv-import';

const URI = `mongodb://localhost:27017`;

export const connect = async (dbName = DB_NAME): Promise<void> => {
  try {
    await mongoose.connect(`${URI}/${dbName}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect();
};

export default {
  connect,
  disconnect,
};
