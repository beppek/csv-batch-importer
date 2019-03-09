import * as fs from 'fs';
import * as crypto from 'crypto';

import Customer, { iCustomer } from '../models/Customer';

const ROOT_DIR = './csv';

const writeHeader = async (path: string) => {
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
      process.env.NODE_ENV === 'test' ? `${Date.now()}-test` : `${Date.now()}`;
    const fullDir = `${ROOT_DIR}/${dir}`;
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir);
    }
    const fileName = 'orders.csv';
    fs.writeFile(`${fullDir}/${fileName}`, '', async err => {
      if (err) {
        return reject(err);
      }
      await writeHeader(`${fullDir}/${fileName}`);
      resolve(`${dir}/${fileName}`);
    });
  });

const generateCustomer = (i: number) => {
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

const generateOrder = (i: number, customer: iCustomer) => {
  const id = crypto
    .createHash('md5')
    .update(
      `${Math.floor(Math.random() * 1000000) + 1}-${i}-${customer.customerId}`,
    )
    .digest('hex');
  const item = 'Toaster';
  return {
    orderId: id,
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

const saveOrdersToCSV = async (orders: string, path: string) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`${ROOT_DIR}/${path}`, { flags: 'a' });
    file.write(orders);
    file.end();
    file.on('close', () => {
      resolve();
    });
    file.on('error', error => {
      reject(error);
    });
  });

export const seed = async (): Promise<{
  path: string;
  totalOrders: number;
}> => {
  const path = await createCSVFile();
  const customers = [];
  let totalOrders = 0;
  let orders: string = '';
  // Generate customers and orders
  for (let i = 0; i < 100000; i++) {
    const customer = generateCustomer(i);
    const numberOfOrders = Math.floor(Math.random() * 25) + 1;
    totalOrders += numberOfOrders;
    orders += generateOrders(customer, numberOfOrders);
    customers.push(customer);
  }
  await saveOrdersToCSV(orders, path);
  await Customer.collection.insertMany(customers);
  console.log(`Generated ${totalOrders} orders`);
  return { path, totalOrders };
};
