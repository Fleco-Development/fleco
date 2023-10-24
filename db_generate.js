import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { program } from 'commander';
import { parse } from 'yaml';

program
	.option('-c, --config <string>', 'Path to config file (e.g. /opt/config.yml)');

program.parse(process.argv);

const configPath = program.opts().config;

const configFile = readFileSync(configPath, 'utf8');
const config = parse(configFile);

const datasourceUrl = `postgresql://${config.database.user}:${config.database.pass}@${config.database.host}:${config.database.port ?? 5432}/${config.database.name}?application_name=fleco`;

DatabaseMigration(datasourceUrl);

function DatabaseMigration(dbUrl) {

	const migrationProcess = exec('npx prisma db push', {
		env: {
			...process.env,
			DATABASE_URL: dbUrl,
		},
	});

	migrationProcess.stderr?.once('data', (data) => {
		console.error(`migration error:\n ${data}`);
	});

	migrationProcess.once('close', (code) => {
		console.log(`migration process exited with code ${code}`);
	});

}