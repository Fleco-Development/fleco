import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import { Temporal } from '@js-temporal/polyfill';

export default class ServerInfoCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('serverinfo')
				.setDescription('Get information about the current server.')
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const createDate = Temporal.Instant.fromEpochMilliseconds(interaction.guild!.createdTimestamp).epochSeconds;
		const ownerInfo = await interaction.guild?.fetchOwner();

		const totalText = interaction.guild?.channels.cache.filter(ch => ch.isTextBased() && !ch.isThread()).size as number;
		const totalVoice = interaction.guild?.channels.cache.filter(ch => ch.isVoiceBased()).size as number;

		const totalUsers = interaction.guild?.members.cache.filter(m => !m.user.bot).size as number;
		const totalBots = interaction.guild?.members.cache.filter(m => m.user.bot).size as number;

		const totalPremiumRoles = interaction.guild?.roles.cache.filter(r => r.tags?.availableForPurchase).size as number;
		const totalIntegrationRoles = interaction.guild?.roles.cache.filter(r => r.tags?.botId || r.tags?.integrationId).size as number;
		const totalLinkedRoles = interaction.guild?.roles.cache.filter(r => r.tags?.guildConnections).size as number;


		const serverEmbed = new EmbedBuilder()
			.setTitle(`Info for ${interaction.guild?.name}`)
			.setDescription(`Owner: ${ownerInfo?.user.username} (${ownerInfo?.id})\nCreated: <t:${createDate}:F>${interaction.guild?.icon ? `\n\n**[Icon Link (WebP)](${interaction.guild.iconURL({ extension: 'webp' })})** | **[Icon Link (PNG)](${interaction.guild?.iconURL({ extension: 'png' })})**` : ''}`)
			.addFields(
				{
					name: `Total Channels: ${totalText + totalVoice}`,
					value: `- **Text:** ${totalText}\n- **Voice:** ${totalVoice}`,
					inline: true,
				},
				{
					name: `Total Members: ${totalUsers + totalBots}`,
					value: `- **Users:** ${totalUsers}\n- **Bots**: ${totalBots}`,
					inline: true,
				},
				{
					name: `Total Roles: ${interaction.guild?.roles.cache.size}`,
					value: `- **Premium:** ${totalPremiumRoles}\n- **Integration/Bot:** ${totalIntegrationRoles}\n- **Linked:** ${totalLinkedRoles}`,
					inline: true,
				},
			)
			.setColor('Blue')
			.setTimestamp();

		if (interaction.guild?.icon) {
			serverEmbed.setThumbnail(interaction.guild.iconURL({ extension: 'webp' }));
		}

		await interaction.reply({ embeds: [ serverEmbed ] });

	}

}