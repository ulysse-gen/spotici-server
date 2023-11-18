import mysql, { QueryOptions } from 'mysql2/promise';

const MysqlConfig = {
  db: {
    /* don't expose password or any sensitive info, done only for demo */
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    connectTimeout: 60000
  }
};

export async function query(sql: string, params?: Array<any>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  const [results, ] = await connection.query(sql, params);
  await connection.end();
  connection.destroy();
  return results;
}

export async function execute(sql: string, params?: Array<any>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  const [results, ] = await connection.execute({sql}, params);
  await connection.end();
  connection.destroy();
  return results;
}

export async function queryTransaction(queries: Array<{sql: string, params?: Array<any>}>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  await connection.beginTransaction();
  const query = queries.map(async query => connection.query(query.sql, query.params));
  await Promise.all(query);
  return connection.commit();
}

export default {query, execute, queryTransaction};