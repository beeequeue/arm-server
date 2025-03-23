# arm-server

[![](https://img.shields.io/github/actions/workflow/status/BeeeQueue/arm-server/cicd.yml?branch=master)](https://github.com/BeeeQueue/arm-server/actions?query=branch%3Amaster+workflow%3ACI)
[![](https://uptime.h.haglund.dev/api/badge/2/uptime/168?label=Uptime%207d)](https://uptime.h.haglund.dev/status/arm-server)

This app uses data from [`Fribb/anime-lists`](https://github.com/Fribb/anime-lists) - fetching
and updating itself every 24 hours.

[`Fribb/anime-lists`](https://github.com/Fribb/anime-lists) is an automatic merged copy of 
[`anime-offline-database`](https://github.com/manami-project/anime-offline-database)
and
[`Anime-Lists/anime-lists`](https://github.com/Anime-Lists/anime-lists).


#### Get notifications on important API changes

Subscribe to new releases in this repo:

![image](https://user-images.githubusercontent.com/472500/121041611-c116fc00-c767-11eb-9aaa-64a894a1598a.png)

### Missing or duplicate entries

Some entries in the database are not mapped correctly due to inconsistent naming - the owner of `anime-offline-database`
cannot fix them due to complexity. Therefore this service has manual rules that combines known failures.

You can help add rules by submitting
a [manual rule request](https://github.com/BeeeQueue/arm-server/issues/new?template=manual-rule-request.md).

## [API Docs](https://arm.haglund.dev/docs)

## Self-hosting

Docker images are built and provided for each commit on master!

The minimum configuration needed can be found in the following command:

```
docker run -it --name arm-server -p 3000:3000 ghcr.io/beeequeue/arm-server:latest
```

## Development

### Server

1. Clone the project
1. Install dependencies - `pnpm`
1. Run database migrations - `pnpm migrate`
1. Download data (optional) - `pnpm fetch-data`
1. Start the server - `pnpm dev`

If the database connection fails double check that your `NODE_ENV` is set to `development`.

### Docs

1. Clone the project
1. Install dependencies - `pnpm`
1. Start the build - `pnpm docs:dev`
1. Open the file in a browser - `redoc-static.html`
1. Edit `docs/openapi.yaml` file
