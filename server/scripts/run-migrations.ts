import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../src/shared/config/env';

const migrationsDir = path.resolve(__dirname, '../migrations');
const direction = process.argv[2] ?? 'up';

async function ensureMigrationsTable(connection: mysql.Connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getConnection() {
  return mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  });
}

async function runUp(connection: mysql.Connection) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.up.sql'))
    .sort();

  const [appliedRows] = await connection.query<mysql.RowDataPacket[]>(
    'SELECT name FROM _migrations ORDER BY id ASC',
  );
  const applied = new Set(appliedRows.map((row) => String(row.name)));

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await connection.beginTransaction();
    try {
      await connection.query(sql);
      await connection.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
      await connection.commit();
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}

async function runDown(connection: mysql.Connection) {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    'SELECT name FROM _migrations ORDER BY id DESC LIMIT 1',
  );

  const latest = rows[0]?.name ? String(rows[0].name) : null;
  if (!latest) {
    console.log('No applied migrations found');
    return;
  }

  const downFile = latest.replace('.up.sql', '.down.sql');
  const downPath = path.join(migrationsDir, downFile);

  if (!fs.existsSync(downPath)) {
    throw new Error(`Missing down migration for ${latest}`);
  }

  const sql = fs.readFileSync(downPath, 'utf-8');
  await connection.beginTransaction();
  try {
    await connection.query(sql);
    await connection.query('DELETE FROM _migrations WHERE name = ?', [latest]);
    await connection.commit();
    console.log(`Rolled back migration: ${latest}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const connection = await getConnection();
  try {
    await ensureMigrationsTable(connection);

    if (direction === 'up') {
      await runUp(connection);
    } else if (direction === 'down') {
      await runDown(connection);
    } else {
      throw new Error(`Unsupported migration direction: ${direction}`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
