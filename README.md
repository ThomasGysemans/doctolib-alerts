# Doctolib scraper

This program detects the next available appointment on [Doctolib](https://www.doctolib.fr/) from an URL.

## How to use

1. Clone the repo (or download the code)

```bash
git clone git@github.com:ThomasGysemans/doctolib-alerts.git
# via HTTPS: https://github.com/ThomasGysemans/doctolib-alerts.git
```

2. Download the dependencies

Make sure [NodeJS](https://nodejs.org/) is installed on your computer and make sure the major version it shows is at least 18.

```bash
node -v
```

Then run the program:

```bash
# open directory of doctolib-alerts
# then...
npm install
npm start
```

You should give a URL to this command, like so:

```bash
npm start https://www.doctolib.fr/prise-de-sang/nord-pas-de-calais
```

The command above would give you the first appointment you can get for a blood test in the region of "Nord Pas de Calais".

Retrieve such a URL by filling up the forms on the [homepage](https://www.doctolib.fr/):

![Homepage](./screenshots/homepage.png)

The command `npm start` can also be customised like so:

|option|default value|description|
|------|-------------|-----------|
|`-s,--silent`|`false`|N'affiche aucun log|
|`-b,--blank`|`false`|Retire les couleurs des logs|

Example:

```bash
npm start -- -b
# This command removes all colors from the logs.
```

Basically, the syntax is `npm start [-bs] [URL]`

The installation of the dependencies might take a minute because it downloads chrome at `~/.cache/puppeteer`. If the installation fails, then install it manually at https://pptr.dev/guides/installation