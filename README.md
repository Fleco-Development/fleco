# ⚠️ Fleco Proof of Concept

This is a proof of concept for Fleco. designed to work with the latest discord.js version. The changes include a switch to typescript for types, addition of eslint rules, multiple package managers and multiple runtimes (NodeJS & Bun).

I feel it is important that these changes are implemented for a better development expierence and to try to keep the codebase neater. With the multiple runtimes, why not?

This will be updated as time goes on adding on the features of the bot.

More deployment features will also be added.

## Delpoyments

- [Pterodactyl Installation](./PTERO_INSTALL.md)

## Setup DB
First, fill in your db credentials in whatever config file you would like to use:

```yaml
database:
  host: 127.0.0.1
  user: <user>
  pass: <pwd>
  name: fleco
  port: 5432
```

Then, execute the command below, replacing `<config>` with the path to your config.

```bash
npm run db:setup -- --config '<config>'
```

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
