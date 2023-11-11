import { AuditLogEvent, EmbedBuilder, Events, Guild, GuildAuditLogsEntry, Message } from 'discord.js';
import { Event } from '../types.js';
import { nanoid } from 'nanoid';
import { Temporal } from '@js-temporal/polyfill';

export default class AuditLogEntryCreate extends Event {

	constructor() {
		super(Events.GuildAuditLogEntryCreate);
	}

	async execute(entry: GuildAuditLogsEntry, guild: Guild) {

		const server = await this.client.db.server.findFirst({
			where: {
				id: guild.id,
			},
			include: {
				config: true,
				modlogs: true,
			},
		});

		if (!server) return;

		const mod = await this.client.users.fetch(entry.executorId!);
		const user = await this.client.users.fetch(entry.targetId!);
		const date = Temporal.Now.instant();

		let msg: Message | null = null;

		if (mod.id === this.client.user?.id) return;

		switch (entry.action) {

		case AuditLogEvent.MemberBanAdd:

			if (server.config?.modlog_chan) {

				const newbanEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
					.setTitle('Event - User Ban')
					.addFields(
						{
							name: 'User Info:',
							value: `- **ID**: ${user.id}\n- **Username:** ${user.username}`,
							inline: true,
						},
						{
							name: 'Mod Info:',
							value: `- **ID:** ${mod.id}\n- Username: ${mod.username}`,
							inline: true,
						},
						{
							name: 'Info:',
							value: `- **Reason:** ${entry.reason ?? 'none'}\n- **Date:** <t:${date.epochSeconds}:f>`,
						},
					)
					.setFooter({ text: `Case Number: ${server.modlogs.length + 1}` })
					.setColor('Red');

				const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

				if (!modlogChan || !modlogChan.isTextBased()) return;

				msg = await modlogChan.send({ embeds: [ newbanEmbed ] });

			}

			await this.client.db.modlog.create({
				data: {
					id: nanoid(),
					serverID: guild.id,
					type: 'ban',
					reason: entry.reason ?? 'none',
					userID: user.id,
					modID: mod.id,
					date: date.toString(),
					caseNum: server.modlogs.length + 1,
					logMsgID: msg?.id,
				},
			});

			break;

		case AuditLogEvent.MemberBanRemove:

			if (server.config?.modlog_chan) {

				const unbanEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
					.setTitle('Event - User Unban')
					.addFields(
						{
							name: 'User Info:',
							value: `- **ID:** ${user.id}\n- **Username:** ${user.username}`,
							inline: true,
						},
						{
							name: 'Mod Info:',
							value: `- **ID:** ${mod.id}\n- **Username:** ${mod.username}`,
							inline: true,
						},
						{
							name: 'Info:',
							value: `- **Reason:** ${entry.reason ?? 'none'}\n- **Date:** <t:${date.epochSeconds}:f>`,
						},
					)
					.setFooter({ text: `Case Number: ${server.modlogs.length + 1}` })
					.setColor('Green');

				const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

				if (!modlogChan || !modlogChan.isTextBased()) return;

				msg = await modlogChan.send({ embeds: [ unbanEmbed ] });

			}

			await this.client.db.modlog.create({
				data: {
					id: nanoid(),
					serverID: guild.id,
					type: 'unban',
					reason: entry.reason ?? 'none',
					userID: user.id,
					modID: mod.id,
					date: date.toString(),
					caseNum: server.modlogs.length + 1,
					logMsgID: msg?.id,
				},
			});


			break;

		case AuditLogEvent.MemberKick:

			if (server.config?.modlog_chan) {

				const kickEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
					.setTitle('Event - User Kick')
					.addFields(
						{
							name: 'User Info:',
							value: `- **ID:** ${user.id}\n- **Username:** ${user.username}`,
							inline: true,
						},
						{
							name: 'Mod Info:',
							value: `- **ID:** ${mod.id}\n- **Username:** ${mod.username}`,
							inline: true,
						},
						{
							name: 'Info:',
							value: `- **Reason:** ${entry.reason ?? 'none'}\n- **Date:** <t:${date.epochSeconds}:f>`,
						},
					)
					.setFooter({ text: `Case Number: ${server.modlogs.length + 1}` })
					.setColor('Gold');

				const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

				if (!modlogChan || !modlogChan.isTextBased()) return;

				msg = await modlogChan.send({ embeds: [ kickEmbed ] });

			}

			await this.client.db.modlog.create({
				data: {
					id: nanoid(),
					serverID: guild.id,
					type: 'kick',
					reason: entry.reason ?? 'none',
					userID: user.id,
					modID: mod.id,
					date: date.toString(),
					caseNum: server.modlogs.length + 1,
					logMsgID: msg?.id,
				},
			});

			break;

		case AuditLogEvent.MemberUpdate:

			for (const change of entry.changes) {

				if (change.key == 'communication_disabled_until') {

					if (!change.new) return;

					if (server.config?.modlog_chan) {

						const endDate = Temporal.Instant.from(change.new as string);

						const muteEmbed = new EmbedBuilder()
							.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
							.setTitle('Event - User Mute')
							.addFields(
								{
									name: 'User Info:',
									value: `- **ID:** ${user.id}\n- **Username:** ${user.username}`,
									inline: true,
								},
								{
									name: 'Mod Info:',
									value: `- **ID:** ${mod.id}\n- **Username:** ${mod.username}`,
									inline: true,
								},
								{
									name: 'Info:',
									value: `- **Reason:** ${entry.reason ?? 'none'}\n- **Muted Until:** <t:${endDate.epochSeconds}:F> **][** <t:${endDate.epochSeconds}:R>\n- **Date:** <t:${date.epochSeconds}:f>`,
								},
							)
							.setFooter({ text: `Case Number: ${server.modlogs.length + 1}` })
							.setColor('Gold');

						const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

						if (!modlogChan || !modlogChan.isTextBased()) return;

						msg = await modlogChan.send({ embeds: [ muteEmbed ] });

					}

					await this.client.db.modlog.create({
						data: {
							id: nanoid(),
							serverID: guild.id,
							type: 'mute',
							reason: entry.reason ?? 'none',
							userID: user.id,
							modID: mod.id,
							date: date.toString(),
							caseNum: server.modlogs.length + 1,
							logMsgID: msg?.id,
						},
					});

					break;

				}

			}

			break;

		}

	}

}