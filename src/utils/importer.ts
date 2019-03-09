import * as fs from 'fs';
import * as csvParser from 'csv-parser';

import Customer from '../models/Customer';
import Order, { iOrder } from '../models/Order';

const buildCustomersMap = async () => {
  const customers = await Customer.find({});
  const map = new Map(
    customers.map(i => [i.customerId, i.firstName] as [string, string]),
  );
  return map;
};

const importOrders = async (orders: iOrder[]) => {
  try {
    await Order.collection.insertMany(orders);
  } catch (error) {
    throw error;
  }
};

export const startImport = (path: string) =>
  new Promise(async (resolve, reject) => {
    const rootDir = './csv';
    const filePath = `${rootDir}/${path}`;
    const customers = await buildCustomersMap();
    let orders: iOrder[] = [];
    const importPromises: Promise<any>[] = [];
    let totalImported = 0;
    const csv = csvParser();
    fs.createReadStream(filePath)
      .pipe(csv)
      .on('data', row => {
        const { orderId, customerId, item, quantity } = row;
        const customer = customers.get(customerId);
        if (customer) {
          orders.push({ orderId, customerId, item, quantity });
        }
        if (orders.length === 350000) {
          importPromises.push(importOrders(orders));
          totalImported += orders.length;
          orders.length = 0;
        }
      })
      .on('end', () => {
        if (orders.length > 0) {
          importPromises.push(importOrders(orders));
          totalImported += orders.length;
        }
        Promise.all(importPromises)
          .then(() => {
            resolve(totalImported);
          })
          .catch(error => {
            reject(error);
          });
      })
      .on('error', error => {
        reject(error);
      });
  });
