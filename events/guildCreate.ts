import { Events, Guild } from 'discord.js';
import { Event } from '../types.js';
import { nanoid } from 'nanoid';

export default class GuildCreateEvent extends Event {

	constructor() {
		super(Events.GuildCreate);
	}

	async execute(guild: Guild) {

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

}