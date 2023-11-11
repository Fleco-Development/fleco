import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import osUtils from 'node-os-utils';
import humanizeBytes from 'pretty-bytes';
import { version } from 'discord.js';
import { Duration } from '@fleco/duration';

export default class StatsCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('stats')
				.setDescription('Get the current runtime statistics of the bot'),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const cpuUsage = await osUtils.cpu.usage();
		const { totalMemMb, usedMemMb, usedMemPercentage } = await osUtils.mem.info();

		const totalMem = humanizeBytes(totalMemMb * 1_000_000);
		const usedMem = humanizeBytes(usedMemMb * 1_000_000);
		const processMem = humanizeBytes(process.memoryUsage().heapUsed);

		const totalUptime = new Duration({ milliseconds: this.client.uptime as number }).toString();

		const statEmbed = new EmbedBuilder()
			.setTitle('Statistics')
			.addFields(
				{
					name: 'System Stats:',
					value: `- CPU Usage: ${cpuUsage}%\n- Total RAM Usage: ${usedMem}/${totalMem} (${usedMemPercentage}%)\n- Process RAM Usage: ${processMem}`,
					inline: true,
				},
				{
					name: 'Runtime Info:',
					value: `- Type: ${process.versions.bun ? 'Bun' : 'Node.JS'}\n- Version: ${process.versions.bun ? `v${Bun.version}` : process.version}\n- Discord.JS Version: v${version}\n- Uptime: ${totalUptime}`,
					inline: true,
				},
				{
					name: 'Bot Info:',
					value: `- Guilds: ${this.client.guilds.cache.size}\n- Channels: ${this.client.channels.cache.size}\n- Users: ${this.client.users.cache.size}`,
					inline: true,
				},
			)
			.setColor('Blue');

		await interaction.reply({ embeds: [ statEmbed ] });

	}

}