import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import { env } from '../config/env';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger({ scope: 'migrations' });
const migrationsDir = path.resolve(process.cwd(), 'migrations');

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
      logger.info('Applied migration', { name: file });
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
    logger.info('No applied migrations found');
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
    logger.info('Rolled back migration', { name: latest });
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
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
