import { Client, Events } from "discord.js";
import { Event } from "../types.js";
import { loadCommands } from "../handlers/loaders/command.js";
import { nanoid } from "nanoid";

export default class ReadyEvent extends Event {

    constructor() {
        super(Events.ClientReady, true);
    }

    async execute(_: Client) {

        this.client.commands = await loadCommands(this.client);

        this.client.guilds.cache.forEach(async guild => {

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
                            }
                        }
                    },
                    include: {
                        config: true,
                    },
                });

            }

        });

        console.log(`Logged in as ${this.client.user?.tag}`);

    }

}