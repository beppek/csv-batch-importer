process.env.NODE_ENV = 'test';

import * as mongoose from 'mongoose';
import db from '../utils/db';

import { startImport } from '../utils/importer';
import Customer from '../models/Customer';
import Order from '../models/Order';
import { seed } from '../scripts/seed';

const saveTestCustomers = async () => {
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
};

describe('Test CSV import', () => {
  beforeAll(async () => {
    try {
      await db.connect();
    } catch (error) {
      console.error(error);
    }
  });

  afterEach(async () => {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (error) {
      console.log(error);
    }
  });

  it('Should read the test CSV file and import to DB', async done => {
    expect.assertions(1);
    await saveTestCustomers();
    const path = 'testfile/orders.csv';
    await startImport(path);
    const orders = await Order.find({});
    expect(orders.length).toEqual(3);
    done();
  });

  it('Should generate a large CSV file and import to DB', async done => {
    jest.setTimeout(20000);
    expect.assertions(1);
    const { path, totalOrders } = await seed();
    const totalImported = await startImport(path);
    expect(totalImported).toEqual(totalOrders);
    done();
  });
});
