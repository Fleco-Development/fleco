import { Client } from "discord.js";
import { Event } from "../../types.js";
import { readdirSync } from "node:fs";
import path from "node:path";

export async function loadEvents(client: Client, eventDir: string): Promise<void> {

    const eventMap: Map<string, Event> = new Map();

    const baseEvtDir = readdirSync(eventDir);

    for(const evtFile of baseEvtDir) {

        const combinedEvtDir = path.join(eventDir, evtFile);

        try {

            const eventClass = await import(combinedEvtDir);

            const event : Event = new eventClass.default();
            event.filePath = combinedEvtDir;

            eventMap.set(event.eventName, event);

            if (event.once) {
                client.once(event.eventName, (...e) => {
                    event.client = client;
                    event.execute(...e);
                });
            } else {
                client.on(event.eventName, (...e) => {
                    event.client = client;
                    event.execute(...e);
                });
            }

        } catch (e) {
            console.log("Invalid event");
            console.error(`error ${e}`);
        }

    }

}