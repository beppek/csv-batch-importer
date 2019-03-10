import * as fs from 'fs';
import * as csvParser from 'csv-parser';

import Customer from '../models/Customer';
import Order, { iOrder } from '../models/Order';

const buildCustomersMap = async (): Promise<Map<string, string>> => {
  const customers = await Customer.find({});
  const map = new Map(
    customers.map(i => [i.customerId, i.firstName] as [string, string]),
  );
  return map;
};

const importOrders = async (orders: iOrder[]): Promise<void> => {
  try {
    await Order.collection.insertMany(orders);
  } catch (error) {
    throw error;
  }
};

export const validatePath = (path: string): boolean => {
  const extRegEx = /(?:\.([^.]+))?$/;
  const fileExt = extRegEx.exec(path)[1];
  if (fileExt !== 'csv') {
    throw new Error('Path specified does not point to a CSV file');
  }
  const exists = fs.existsSync(path);
  if (!exists) {
    throw new Error('Could not find a CSV file at the specified path');
  }
  return true;
};

export const startImport = (path: string): Promise<number> =>
  new Promise(async (resolve, reject) => {
    const customers = await buildCustomersMap();
    let orders: iOrder[] = [];
    const importPromises: Promise<any>[] = [];
    let totalImported = 0;
    const csv = csvParser();
    fs.createReadStream(path)
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
