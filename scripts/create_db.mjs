import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'agri_sahayak';

async function run() {
  try {
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database ${dbName} ensured`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    process.exit(1);
  }
}

run();
