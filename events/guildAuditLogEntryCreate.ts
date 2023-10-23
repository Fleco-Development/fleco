import { AuditLogEvent, EmbedBuilder, Events, Guild, GuildAuditLogsEntry } from "discord.js";
import { Event } from "../types.js";
import { nanoid } from "nanoid";
import { Temporal } from "@js-temporal/polyfill";

export default class AuditLogEntryCreate extends Event {

    constructor() {
        super(Events.GuildAuditLogEntryCreate)
    }

    async execute(entry: GuildAuditLogsEntry, guild: Guild) {

        const server = await this.client.db.server.findFirst({
            where: {
                id: guild.id
            },
            include: {
                config: true,
                modlogs: true
            }
        });

        if (!server) return;

        const mod = await this.client.users.fetch(entry.executorId!);
        const user = await this.client.users.fetch(entry.targetId!);
        const date = Temporal.Now.instant();
        
        switch(entry.action) {

            case AuditLogEvent.MemberBanAdd:

                this.client.db.modlog.create({
                    data: {
                        id: nanoid(),
                        serverID: guild.id,
                        type: "ban",
                        reason: entry.reason ?? "none",
                        userID: user.id,
                        modID: mod.id,
                        date: date.toString(),
                    }
                });

                if (server.config?.modlog_chan) {

                    const newbanEmbed = new EmbedBuilder()
                        .setAuthor({ name: "Fleco Modlog", iconURL: this.client.user?.displayAvatarURL({ extension: "webp"}) }) 
                        .setTitle("Event - User Ban")
                        .addFields(
                            {
                                name: "User Info:",
                                value: `- ID: ${user.id}\n- Username: ${user.username}`,
                                inline: true,
                            },
                            {
                                name: "Mod Info:",
                                value: `- ID: ${mod.id}\n-Username: ${mod.username}`,
                                inline: true,
                            },
                            {
                                name: "Info:",
                                value: `-**Reason:** ${entry.reason ?? "none"}\n-**Date:** <t:${date.epochSeconds}:f>`,
                            }
                        )

                    const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

                    if (!modlogChan || !modlogChan.isTextBased()) return;

                    modlogChan.send({ embeds: [ newbanEmbed ] });

                }

                break;
            
            case AuditLogEvent.MemberBanRemove:

                this.client.db.modlog.create({
                    data: {
                        id: nanoid(),
                        serverID: guild.id,
                        type: "unban",
                        reason: entry.reason ?? "none",
                        userID: user.id,
                        modID: mod.id,
                        date: Temporal.Now.instant.toString(),
                    }
                });

                if (server.config?.modlog_chan) {

                    const unbanEmbed = new EmbedBuilder()
                        .setAuthor({ name: "Fleco Modlog", iconURL: this.client.user?.displayAvatarURL({ extension: "webp"}) }) 
                        .setTitle("Event - User Ban")
                        .addFields(
                            {
                                name: "User Info:",
                                value: `- ID: ${user.id}\n- Username: ${user.username}`,
                                inline: true,
                            },
                            {
                                name: "Mod Info:",
                                value: `- ID: ${mod.id}\n-Username: ${mod.username}`,
                                inline: true,
                            },
                            {
                                name: "Info:",
                                value: `-**Reason:** ${entry.reason ?? "none"}\n-**Date:** <t:${date.epochSeconds}:f>`,
                            }
                        )

                    const modlogChan = await guild.channels.fetch(server.config.modlog_chan);

                    if (!modlogChan || !modlogChan.isTextBased()) return;

                    modlogChan.send({ embeds: [ unbanEmbed ] });

                }

                break;

        }

    }

}