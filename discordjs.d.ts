import type { Command } from './types.ts';
import { PrismaClient } from '@prisma/client';

declare module 'discord.js' {
    interface Client {
        commands: Map<string, Command>;
        commandDir: string;
        db: PrismaClient;
    }
}