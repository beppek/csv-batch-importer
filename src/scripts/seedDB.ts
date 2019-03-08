import * as crypto from 'crypto';
import * as mongoose from 'mongoose';
import Customer from '../models/Customer';

export const generateCustomer = (i: number) => {
  const timestamp = Date.now();
  const firstName = crypto
    .createHash('sha1')
    .update(`${timestamp}-1`)
    .digest('hex');
  const lastName = crypto
    .createHash('sha1')
    .update(`${timestamp}-2`)
    .digest('hex');
  return {
    customerId: `${timestamp}-${i}`,
    firstName,
    lastName,
  };
};

const init = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(`mongodb://localhost:27017/csv-import`);
    mongoose.set('useCreateIndex', true);
    console.log('Connected.');
    console.log('Generating customers...');
    const customers = [];
    for (let i = 0; i < 10000; i++) {
      customers.push(generateCustomer(i));
    }
    console.log('Saving customers in batch');
    await Customer.collection.insertMany(customers);
    console.log('Done saving customers in batch');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

init();
