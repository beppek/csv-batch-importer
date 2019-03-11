process.env.NODE_ENV = 'test';

import * as fs from 'fs';
import { performance } from 'perf_hooks';
import * as mongoose from 'mongoose';
import chalk from 'chalk';

import { startImport } from '../utils/importer';
import db from '../utils/db';
import { seed } from '../scripts/seed';

const run = async () => {
  let filePath: string;
  try {
    console.log(chalk.yellow('Connecting to database...'));
    await db.connect();
    console.log(chalk.green('Connected.'));
    console.log(chalk.yellow('Generating orders and customers...'));
    const { path, totalOrders } = await seed(true);
    filePath = path;
    console.log(
      chalk.cyan(`${totalOrders} orders generated, importing to DB...`),
    );
    const startTime = performance.now();
    const totalImported = await startImport(path);
    const endTime = performance.now();
    if (totalImported !== totalOrders) {
      throw new Error(
        `Not all orders were imported. Expected: ${totalOrders}. Received: ${totalImported}`,
      );
    }
    console.log(
      chalk.green(
        `${totalOrders} orders were successfully imported to the database in ${endTime -
          startTime} ms`,
      ),
    );
  } catch (error) {
    console.error(error);
  }
  console.log(chalk.magentaBright('Cleaning up before exit...'));
  await mongoose.connection.db.dropDatabase();
  fs.unlink(filePath, error => {
    if (error) {
      console.error(error);
    }
    process.exit(0);
  });
};

run();
