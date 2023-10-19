# ⚠️ Fleco Proof of Concept

This is a proof of concept for Fleco. designed to work with the latest discord.js version. The changes include a switch to typescript for types, addition of eslint rules, multiple package managers and multiple runtimes (NodeJS & Bun).

I feel it is important that these changes are implemented for a better development expierence and to try to keep the codebase neater. With the multiple runtimes, why not?

This will be updated as time goes on adding on the features of the bot.

More deployment features will also be added.

## Delpyments

- [Pterodactyl Installation](./PTERO_INSTALL.md)

## How to Install

### NodeJS

#### NVM Installation

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
```

#### Node Installation

```bash
nvm install --lts --default --latest-npm
```

### Bun

#### Bun Installation

```bash
curl -fsSL https://bun.sh/install | bash
```

## How to run

### Bun

```bash
bun start:bun -- --config /path/to/config
```

### NPM

```bash
npm run start -- --config test_config.yml
```

### PNPM

```bash
pnpm run start --config test_config.yml
```

