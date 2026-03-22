import { runMigrations } from '../src/shared/database/migrations';

const direction = (process.argv[2] ?? 'up') as 'up' | 'down';

runMigrations(direction).catch((error) => {
  console.error(error);
  process.exit(1);
});
