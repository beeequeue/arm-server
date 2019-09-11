# arm-server

[![](https://img.shields.io/travis/BeeeQueue/arm-server.svg)](https://travis-ci.org/BeeeQueue/arm-server)
![](https://img.shields.io/uptimerobot/ratio/m781899942-e512424b17b53ca46ae043b6.svg?label=30-day%20uptime)

This app uses data from [`anime-offline-database`](https://github.com/manami-project/anime-offline-database/) - fetching and updating itself every 24 hours.

### Missing or duplicate entries

Some entries in the database are not mapped correctly due to inconsistent naming - the owner of `anime-offline-database` cannot fix them due to complexity. Therefore this service has manual rules that combines known failures.

You can help add rules by submitting a [manual rule request](https://github.com/BeeeQueue/arm-server/issues/new?template=manual-rule-request.md).

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

`GET` `/api/ids`

Either use query parameters:
`?source={Source}&id={number}`

or send the query as a JSON body:

`{ "anilist": 1337 }`

`[{ "anilist": 1337, "anilist": 69, "anidb": 420 }]`

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

**The response code will always be 200 (OK) or 204 (No content).**
If an entry is not found `null` is returned instead.

## Development

1. Clone the project
1. Install dependencies - `yarn`
1. Run database migrations - `yarn migrate`
1. Download data (optional) - `yarn fetch-data`
1. Start the server - `yarn dev`

If the database connection fails double check that your `NODE_ENV` is set to `development`.
