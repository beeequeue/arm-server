export const dbConfig = {
  client: 'pg',
  connection: process.env.DB_URL as string,
  searchPath: ['arm', 'public'],
}