import { ChatInputCommandInteraction, Colors, EmbedBuilder, HexColorString, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import { Temporal } from '@js-temporal/polyfill';

export default class UserInfoCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('userinfo')
				.setDescription('Get information about a user.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('User to get info from')
						.setRequired(false),
				)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const memberFetch = interaction.options.getUser('user', false) || interaction.member?.user;
		const member = await interaction.guild?.members.fetch(memberFetch!.id);

		const createDate = Temporal.Instant.fromEpochMilliseconds(member!.user.createdTimestamp).epochSeconds;
		const joinDate = Temporal.Instant.fromEpochMilliseconds(member!.joinedTimestamp!).epochSeconds;

		const roles = member?.roles.cache.filter(role => role.id !== interaction.guild?.id).map(role => `<@&${role.id}>`).join(', ');

		const userEmbed = new EmbedBuilder()
			.setTitle(`Info for ${member?.user.username}`)
			.setThumbnail(member!.displayAvatarURL({ extension: 'webp' }))
			.setDescription(`${member?.nickname ? `Nickname: ${member.nickname}\n` : ''}Global Name: ${member?.user.globalName}\nUsername: ${member?.user.username}\nID: ${member?.id}\nJoined: <t:${joinDate}:F>\nCreated: <t:${createDate}:F>${member?.user.avatarURL() ? `\n**[Icon Link (WebP)](${member.user.displayAvatarURL({ extension: 'webp' })})** | **[Icon Link (PNG)](${member.user.displayAvatarURL({ extension: 'png' })})**` : ''}`)
			.addFields(
				{
					name: 'Roles:',
					value: `${roles}`,
				},
			)
			.setTimestamp()
			.setColor(`${member!.user.accentColor ? `#${member!.user.accentColor.toString(16)}` as HexColorString : 'Blue' as keyof typeof Colors}`);

		await interaction.reply({ embeds: [ userEmbed ] });

	}

}