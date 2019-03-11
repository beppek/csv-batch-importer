# CSV BATCH IMPORTER

CLI which imports orders from a CSV file to a MongoDB database.

## Getting started

**This project depends on a running, local instance of MongoDB.**

Run `npm i` and once the packages have installed start the CLI with `npm start`. The CLI will prompt for the absolute path to the CSV file. _Please note that relative paths also work_. You can navigate to the path as you normally would in the terminal, using tab for autocompletion. The CLI accepts file input pointing to a CSV file anywhere in the file system that the current user has access to.

## Tests

You can run the tests for the project with `npm test`.

There is also a performance test included in a separate script. Run it with `npm run performance`. The test will generate ~10 million orders, import them to the DB and benchmark the results.

Below are the results from 10 performance runs on my local machine.

| Execution | Orders   |          Time (ms) |
| --------- | -------- | -----------------: |
| 1         | 10026073 |   58803.0369650051 |
| 2         | 10022565 | 59086.787049002945 |
| 3         | 10029120 | 58603.611980997026 |
| 4         | 10026668 |  59375.90797100216 |
| 5         | 10013255 |  61086.39444299787 |
| 6         | 10031534 |  58990.38661400229 |
| 7         | 10027500 |  59462.11765599996 |
| 8         | 10027562 |  59486.45679099858 |
| 9         | 10014951 | 58674.933624997735 |
| 10        | 10028410 |  58437.72890000045 |
