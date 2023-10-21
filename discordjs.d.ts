import { Command } from "./types.ts";

declare module "discord.js" {
    interface Client {
        public static commands: Map<string, Command>;
        public static commandDir: string;
    }
}