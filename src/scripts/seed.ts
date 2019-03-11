import * as fs from 'fs';
import * as crypto from 'crypto';

import Customer, { iCustomer } from '../models/Customer';
import { iOrder } from '../models/Order';

const ROOT_DIR = './csv';

const writeHeader = async (path: string): Promise<void> => {
  const file = fs.createWriteStream(`${path}`);
  file.write('orderId,customerId,item,quantity\n');
  file.end();
};

const createCSVFile = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR);
    }
    const dir =
      process.env.NODE_ENV === 'test'
        ? `${ROOT_DIR}/temp`
        : `${ROOT_DIR}/${Date.now()}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const fileName = 'orders.csv';
    fs.writeFile(`${dir}/${fileName}`, '', async err => {
      if (err) {
        return reject(err);
      }
      await writeHeader(`${dir}/${fileName}`);
      resolve(`${dir}/${fileName}`);
    });
  });

const generateCustomer = (i: number): iCustomer => {
  const id = crypto
    .createHash('md5')
    .update(`${Math.floor(Math.random() * 1000000) + 1}-${i}`)
    .digest('hex');
  const firstName = `FirstName${i}`;
  const lastName = `LastName${i}`;
  return {
    customerId: id,
    firstName,
    lastName,
  };
};

const generateOrder = (i: number, customer: iCustomer): iOrder => {
  const id = crypto
    .createHash('md5')
    .update(
      `${Math.random()
        .toString(36)
        .substr(2, 9)}-${i}-${customer.customerId}-${Math.random() * 1000000}`,
    )
    .digest('hex');
  const item = 'Toaster';
  return {
    orderId: id,
    customerId: customer.customerId,
    item,
    quantity: Math.floor(Math.random() * 5) + 1,
  };
};

const generateOrders = (
  customer: iCustomer,
  numberOfOrders: number,
): string => {
  let orders: string = '';
  for (let i = 0; i < numberOfOrders; i += 1) {
    const order = generateOrder(i, customer);
    orders += `${order.orderId},${customer.customerId},${order.item},${
      order.quantity
    }\n`;
  }
  return orders;
};

const saveOrdersToCSV = async (orders: string, path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path, { flags: 'a' });
    file.write(orders);
    file.end();
    file.on('close', () => {
      resolve();
    });
    file.on('error', error => {
      reject(error);
    });
  });

const createExtraOrders = async (
  customers: iCustomer[],
  path: string,
): Promise<number> => {
  let totalOrders = 0;
  let orders = '';
  const promises: Promise<void>[] = [];
  for (let i = 0; i < 15; i++) {
    customers.forEach(customer => {
      const numberOfOrders = Math.floor(Math.random() * 25) + 1;
      totalOrders += numberOfOrders;
      orders += generateOrders(customer, numberOfOrders);
    });
    promises.push(saveOrdersToCSV(orders, path));
    orders = '';
  }
  await Promise.all(promises);
  return totalOrders;
};

export const seed = async (
  generateExtraOrders: boolean = false,
): Promise<{
  path: string;
  totalOrders: number;
}> => {
  const path = await createCSVFile();
  const customers = [];
  let totalOrders = 0;
  let orders: string = '';
  // Generate customers and orders
  for (let i = 0; i < 50000; i++) {
    const customer = generateCustomer(i);
    const numberOfOrders = Math.floor(Math.random() * 10) + 1;
    totalOrders += numberOfOrders;
    orders += generateOrders(customer, numberOfOrders);
    customers.push(customer);
  }
  await saveOrdersToCSV(orders, path);
  if (generateExtraOrders) {
    totalOrders += await createExtraOrders(customers, path);
  }
  await Customer.collection.insertMany(customers);
  return { path, totalOrders };
};
