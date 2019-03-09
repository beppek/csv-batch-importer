import * as mongoose from 'mongoose';

const { NODE_ENV } = process.env;

const dbName = NODE_ENV === 'test' ? 'test-csv-import' : 'csv-import';

const URI = `mongodb://localhost:27017/${dbName}`;

export const connect = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const disconnect = async () => {
  await mongoose.disconnect();
};

export default {
  connect,
  disconnect,
};
