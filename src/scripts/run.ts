import * as mongoose from 'mongoose';
import { seed } from './seed';

const init = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(`mongodb://localhost:27017/csv-import`);
    mongoose.set('useCreateIndex', true);
    console.log('Connected.');
    console.log('Generating customers and orders file...');
    await seed();
    console.log('Done');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

init();
