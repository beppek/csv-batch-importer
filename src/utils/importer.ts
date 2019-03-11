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

const importOrders = async (orders: iOrder[]): Promise<number> => {
  try {
    await Order.collection.insertMany(orders);
    return orders.length;
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
    const importPromises: Promise<number>[] = [];
    fs.createReadStream(path)
      .pipe(csvParser())
      .on('data', async row => {
        const { orderId, customerId, item, quantity } = row;
        const customer = customers.get(customerId);
        if (customer) {
          orders.push({ orderId, customerId, item, quantity });
        }
        if (orders.length === 250000) {
          const ordersToImport = orders.slice();
          orders.length = 0;
          try {
            importPromises.push(importOrders(ordersToImport));
          } catch (error) {
            reject(error);
          }
        }
      })
      .on('end', async () => {
        if (orders.length > 0) {
          const ordersToImport = orders.slice();
          orders.length = 0;
          try {
            importPromises.push(importOrders(ordersToImport));
            const imports = await Promise.all(importPromises);
            const totalImported = imports.reduce((total, num) => total + num);
            resolve(totalImported);
          } catch (error) {
            reject(error);
          }
        }
      });
  });
