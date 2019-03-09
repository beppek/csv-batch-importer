process.env.NODE_ENV = 'test';

import * as mongoose from 'mongoose';
import db from '../utils/db';

import { startImport } from '../utils/importer';
import Customer from '../models/Customer';

describe('Test CSV import', () => {
  beforeAll(async () => {
    try {
      await db.connect();
      const customer = {
        customerId: 'ABC123',
        firstName: 'Mr',
        lastName: 'Customer',
      };
      const customer2 = {
        customerId: 'ABC124',
        firstName: 'Ms',
        lastName: 'Customer2',
      };
      await Customer.create(customer2);
      await Customer.create(customer);
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

  it('Should read the test CSV file', async done => {
    expect.assertions(1);
    const path = 'testfile/orders.csv';
    await startImport(path);

    done();
  });
});
