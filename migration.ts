import { exec } from 'node:child_process';

export default function DatabaseMigration(datasourceUrl: string) {

	const migrationProcess = exec('npx prisma db push --skip-generate', {
		env: {
			...process.env,
			DATABASE_URL: datasourceUrl,
		},
	});

	migrationProcess.stderr?.once('data', (data) => {
		console.error(`migration error:\n ${data}`);
	});

	migrationProcess.once('close', (code) => {
		console.log(`migration process exited with code ${code}`);
	});

}