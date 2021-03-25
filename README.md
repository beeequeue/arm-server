# arm-server

[![](https://img.shields.io/github/workflow/status/BeeeQueue/arm-server/CI)](https://github.com/BeeeQueue/arm-server/actions?query=branch%3Amaster+workflow%3ACI)
[![](https://img.shields.io/uptimerobot/ratio/m781899942-e512424b17b53ca46ae043b6.svg?label=30-day%20uptime)](https://app.pingr.io/status/wMuqVw6w)

This app uses data from [`anime-offline-database`](https://github.com/manami-project/anime-offline-database/) - fetching
and updating itself every 24 hours.

[![Deploy to DigitalOcean](https://mp-assets1.sfo2.digitaloceanspaces.com/deploy-to-do/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/BeeeQueue/arm-server/tree/master&refcode=52b251df60e7)

### Missing or duplicate entries

Some entries in the database are not mapped correctly due to inconsistent naming - the owner of `anime-offline-database`
cannot fix them due to complexity. Therefore this service has manual rules that combines known failures.

You can help add rules by submitting
a [manual rule request](https://github.com/BeeeQueue/arm-server/issues/new?template=manual-rule-request.md).

## API

**Base URL:** `https://relations.yuna.moe`

```ts
enum Source {
  anilist,
  anidb,
  myanimelist,
  kitsu,
}
```

### Get IDS:

`GET/POST` `/api/ids`

Either use GET query parameters:
`?source={Source}&id={number}`

or send the query as a POST JSON body:

`{ "anilist": 1337 }`

`[{ "anilist": 1337 }, { "anilist": 69 }, { "anidb": 420 }]`

#### Response

```ts
interface Entry {
  anilist: number | null
  anidb: number | null
  myanimelist: number | null
  kitsu: number | null
}

// { "anilist": 1337 } => Entry | null
// [{ ... }] => Array<Entry | null>
```

**The response code will always be 200 (OK).**
If an entry is not found `null` is returned instead.

## Changelog

#### 2020-12-27

API no longer returns `204`s - now always returns `200` with a `null` JSON body.

## Development

1. Clone the project
1. Install dependencies - `yarn`
1. Run database migrations - `yarn migrate`
1. Download data (optional) - `yarn fetch-data`
1. Start the server - `yarn dev`

If the database connection fails double check that your `NODE_ENV` is set to `development`.
