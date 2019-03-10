process.env.NODE_ENV = 'test';

import * as mongoose from 'mongoose';
import db from '../utils/db';
import Customer from '../models/Customer';
import Order from '../models/Order';

describe('Test Models', () => {
  beforeAll(async () => {
    try {
      await db.connect('modelstest-csv-import');
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

  it('Should successfully save a customer', async done => {
    expect.assertions(1);
    const customer = {
      customerId: 'ABC111',
      firstName: 'Mr',
      lastName: 'Customer',
    };
    const customerModel = await Customer.create(customer);
    expect(customerModel.customerId).toEqual(customer.customerId);
    done();
  });

  it('Should successfully save an order', async done => {
    expect.assertions(1);
    const order = {
      orderId: '123ABC',
      customerId: 'ABC1111',
      item: 'Computer',
      quantity: 1,
    };
    const orderModel = await Order.create(order);
    expect(orderModel.orderId).toEqual(order.orderId);
    done();
  });
});
