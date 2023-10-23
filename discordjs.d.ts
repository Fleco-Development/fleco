import type { Command } from "./types.ts";
import { PrismaClient } from "@prisma/client";

declare module "discord.js" {
    interface Client {
        public static commands: Map<string, Command>;
        public static commandDir: string;
        public db: PrismaClient;
    }
}