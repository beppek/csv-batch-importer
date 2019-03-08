process.env.NODE_ENV = 'test';

import * as mongoose from 'mongoose';
import db from '../utils/db';
import Customer from '../models/Customer';
import { generateCustomer } from '../scripts/seedDB';

describe('Test CSV import', () => {
  beforeAll(async () => {
    try {
      await db.connect();
      const customers = [];
      for (let i = 0; i < 10000; i++) {
        customers.push(generateCustomer(i));
      }
      await Customer.collection.insertMany(customers);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (error) {
      console.log(error);
    }
  });
});
