import { performance } from 'perf_hooks';
import chalk from 'chalk';
import * as figlet from 'figlet';
import * as inquirer from 'inquirer';
import { PathPrompt } from 'inquirer-path';

import { startImport, validatePath } from './utils/importer';
import db from './utils/db';

const printHeader = () => {
  console.clear();
  const font = 'Speed';
  console.log(chalk.green(figlet.textSync('CSV BATCH', { font })));
  console.log(chalk.magenta(figlet.textSync('IMPORTER', { font })));
  console.log(chalk.blue('By Max Karlsson - https://github.com/beppek'));
};

export const init = async (path: string) => {
  try {
    console.log(chalk.yellow('Connecting to database...'));
    await db.connect();
    console.log(chalk.green('Connected.'));
    console.log(
      chalk.yellow(`Starting import from file at ${path}. Please wait ...`),
    );
    const startTime = performance.now();
    const totalOrders = await startImport(path);
    const endTime = performance.now();
    console.log(
      chalk.blueBright(
        `${totalOrders} orders were successfully imported to the database in ${endTime -
          startTime} ms`,
      ),
    );
  } catch (error) {
    console.log(
      chalk.red(
        'Something went wrong while importing the file. Check the error below for more information',
      ),
    );
    console.error(error);
  }
  process.exit(0);
};

const getFilePath = async (errorMessage?: string) => {
  try {
    if (errorMessage) {
      printHeader();
      console.log(chalk.red(errorMessage));
    }
    inquirer.registerPrompt('path', PathPrompt);
    const { path } = await inquirer.prompt([
      {
        name: 'path',
        type: 'path',
        message: 'Please, specify the path to the CSV file you wish to import',
      },
    ]);
    validatePath(path);
    await init(path);
  } catch (error) {
    await getFilePath(error.message);
  }
};

const run = async () => {
  printHeader();
  await getFilePath();
};

run();
