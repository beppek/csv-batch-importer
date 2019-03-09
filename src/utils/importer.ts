import * as fs from 'fs';
import * as csv from 'csv-parser';

import Customer, { CustomerModel } from '../models/Customer';
import Order, { iOrder } from '../models/Order';

const buildCustomersMap = async () => {
  const customers = await Customer.find({});
  const map = new Map(
    customers.map(i => [i.customerId, i] as [string, CustomerModel]),
  );
  return map;
};

const importOrders = async (orders: iOrder[]) => {
  Order.collection.insertMany(orders);
};

export const startImport = async (path: string) => {
  const rootDir = './csv';
  const filePath = `${rootDir}/${path}`;
  const customers = await buildCustomersMap();
  const orders: iOrder[] = [];
  const stream = fs
    .createReadStream(filePath)
    .pipe(csv())
    .on('data', row => {
      const { orderId, customerId, item, quantity } = row;
      const customer = customers.get(customerId);
      if (customer) {
        orders.push({ orderId, customerId, item, quantity });
      }
    })
    .on('end', () => {
      importOrders(orders);
    });
};
