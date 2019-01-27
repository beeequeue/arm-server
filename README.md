# arm-server

This app uses data from [anime-offline-database](https://github.com/manami-project/anime-offline-database/) - fetching and updating itself every 24 hours.

## API

**Base URL:** `https://relations.yuna.moe`

`GET` `/api/ids?source={anilist|anidb|myanimelist|kitsu}&id={number}`

```ts
interface Response {
  anilist?: number
  anidb?: string
  myanimelist?: number
  kitsu?: number
}
```

or a `404` if the it could not be found.
