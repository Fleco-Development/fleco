import { AuditLogEvent, Events, Guild, GuildAuditLogsEntry } from "discord.js";
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
                        date: Temporal.Now.instant.toString(),
                    }
                });

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

                break;

        }

    }

}