process.env.NODE_ENV = 'test';

import * as fs from 'fs';
import * as mongoose from 'mongoose';
import db from '../utils/db';

import { startImport, validatePath } from '../utils/importer';
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
      await db.connect('unittest-csv-import');
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
    const path = './csv/testfile/orders.csv';
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
    fs.unlink(path, error => {
      if (error) {
        console.error(error);
      }
      done();
    });
  });

  it('Should validate correct path to CSV file', () => {
    expect.assertions(1);
    const path = './csv/testfile/orders.csv';
    const valid = validatePath(path);
    expect(valid).toBeTruthy();
  });

  it('Should throw error on incorrect path to CSV file', () => {
    expect.assertions(1);
    const path = './no/file/here.csv';
    try {
      validatePath(path);
    } catch (error) {
      expect(error.message).toEqual(
        'Could not find a CSV file at the specified path',
      );
    }
  });

  it('Should throw error when path points to non-CSV file', () => {
    expect.assertions(1);
    const path = './not/a/csv/file.txt';
    try {
      validatePath(path);
    } catch (error) {
      expect(error.message).toEqual(
        'Path specified does not point to a CSV file',
      );
    }
  });
});
