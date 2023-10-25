import { ActivityType, Client, Events } from 'discord.js';
import { Event } from '../types.js';
import { loadCommands } from '../handlers/loaders/command.js';
import { nanoid } from 'nanoid';

export default class ReadyEvent extends Event {

	constructor() {
		super(Events.ClientReady, true);
	}

	async execute(_client: Client) {

		this.client.user?.setActivity({
			type: ActivityType.Custom,
			state: 'Creating bugs...',
			name: 'fleco',
		});

		this.client.user?.setStatus('dnd');

		this.client.commands = await loadCommands(this.client);

		for (const [_key, guild] of this.client.guilds.cache) {

			if (!guild.available) return;

			const result = await this.client.db.server.findUnique({
				where: {
					id: guild.id,
				},
			});

			if (!result) {

				await this.client.db.server.create({
					data: {
						id: guild.id,
						config: {
							create: {
								id: nanoid(),
							},
						},
					},
					include: {
						config: true,
					},
				});

			}

		}

		console.log(`Logged in as ${this.client.user?.tag}`);

	}

}