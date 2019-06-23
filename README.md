# arm-server
[![](https://img.shields.io/travis/BeeeQueue/arm-server.svg)](https://travis-ci.org/BeeeQueue/arm-server)
![](https://img.shields.io/uptimerobot/ratio/m781899942-e512424b17b53ca46ae043b6.svg?label=30-day%20uptime)

This app uses data from [`anime-offline-database`](https://github.com/manami-project/anime-offline-database/) - fetching and updating itself every 24 hours.

### Missing or duplicate entries

Some entries in the database are not mapped correctly due to inconsistent naming - the owner of `anime-offline-database` cannot fix them due to complexity. Therefore this service has manual rules that combines known failures. 

You can help add rules by submitting a [manual rule request](https://github.com/BeeeQueue/arm-server/issues/new?template=manual-rule-request.md).

## API

**Base URL:** `https://relations.yuna.moe`

`GET` `/api/ids?source={anilist|anidb|myanimelist|kitsu}&id={number}`

```ts
interface Response {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
```

or a `404` if the it could not be found.

## Development

1. Clone the project
1. Install dependencies - `yarn`
1. Run database migrations - `yarn migrate`
1. Download data (optional) - `yarn fetch-data`
1. Start the server - `yarn dev`

If the database connection fails double check that your `NODE_ENV` is set to `development`.
