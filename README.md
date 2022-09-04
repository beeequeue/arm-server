# arm-server

[![](https://img.shields.io/github/workflow/status/BeeeQueue/arm-server/CI)](https://github.com/BeeeQueue/arm-server/actions?query=branch%3Amaster+workflow%3ACI)
[![](https://img.shields.io/uptimerobot/ratio/m781899942-e512424b17b53ca46ae043b6.svg?label=30-day%20uptime)](https://app.pingr.io/status/wMuqVw6w)

This app uses data from [`anime-offline-database`](https://github.com/manami-project/anime-offline-database/) - fetching
and updating itself every 24 hours.

#### Get notifications on important API changes

Subscribe to new releases in this repo:

![image](https://user-images.githubusercontent.com/472500/121041611-c116fc00-c767-11eb-9aaa-64a894a1598a.png)

### Missing or duplicate entries

Some entries in the database are not mapped correctly due to inconsistent naming - the owner of `anime-offline-database`
cannot fix them due to complexity. Therefore this service has manual rules that combines known failures.

You can help add rules by submitting
a [manual rule request](https://github.com/BeeeQueue/arm-server/issues/new?template=manual-rule-request.md).

## API

**Base URL:** `https://arm.haglund.dev`

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

Either use GET with query parameters:
`?source={Source}&id={number}`

or use POST with a JSON body:

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

// If JSON body is a single object
// { "anilist": 1337 } => Entry | null
// // If JSON body is an array of objects
// [{ ... }] => Array<Entry | null>
```

**The response code will always be 200 (OK).**
If an entry is not found `null` is returned instead.

## Development

1. Clone the project
1. Install dependencies - `pnpm`
1. Run database migrations - `pnpm migrate`
1. Download data (optional) - `pnpm fetch-data`
1. Start the server - `pnpm dev`

If the database connection fails double check that your `NODE_ENV` is set to `development`.
