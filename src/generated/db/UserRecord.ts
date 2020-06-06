/* eslint-disable */
// tslint:disable
// this file is generated by a tool; don't change it manually.

export type UserRecord_AllTypes = [
  {
    /** pg_type.typname: int4 */
    id: number
    /** pg_type.typname: varchar */
    username: string
    /** pg_type.typname: varchar */
    email: string
    /** pg_type.typname: int4 */
    foursquare_id: number
    /** pg_type.typname: timestamp */
    created_at: unknown
    /** pg_type.typname: timestamp */
    updated_at: unknown
  }
]
export interface UserRecord_QueryTypeMap {
  [`select * from users
          where email = $1`]: UserRecord_AllTypes[0]
  [`select * from users 
          where username = $1`]: UserRecord_AllTypes[0]
  [`update users set email = $1, username = $2
                  where email = $3
                  returning *`]: UserRecord_AllTypes[0]
  [`update users set foursquare_id = $1
              where email = $2
              returning *`]: UserRecord_AllTypes[0]
}

export type UserRecord_UnionType = UserRecord_QueryTypeMap[keyof UserRecord_QueryTypeMap]

export type UserRecord = {
  [K in keyof UserRecord_UnionType]: UserRecord_UnionType[K]
}
export const UserRecord = {} as UserRecord

export const UserRecord_meta_v0 = [{"properties":[{"name":"id","value":"number","description":"pg_type.typname: int4"},{"name":"username","value":"string","description":"pg_type.typname: varchar"},{"name":"email","value":"string","description":"pg_type.typname: varchar"},{"name":"foursquare_id","value":"number","description":"pg_type.typname: int4"},{"name":"created_at","value":"unknown","description":"pg_type.typname: timestamp"},{"name":"updated_at","value":"unknown","description":"pg_type.typname: timestamp"}],"description":"select * from users\n        where email = $1"},{"properties":[{"name":"id","value":"number","description":"pg_type.typname: int4"},{"name":"username","value":"string","description":"pg_type.typname: varchar"},{"name":"email","value":"string","description":"pg_type.typname: varchar"},{"name":"foursquare_id","value":"number","description":"pg_type.typname: int4"},{"name":"created_at","value":"unknown","description":"pg_type.typname: timestamp"},{"name":"updated_at","value":"unknown","description":"pg_type.typname: timestamp"}],"description":"select * from users \n        where username = $1"},{"properties":[{"name":"id","value":"number","description":"pg_type.typname: int4"},{"name":"username","value":"string","description":"pg_type.typname: varchar"},{"name":"email","value":"string","description":"pg_type.typname: varchar"},{"name":"foursquare_id","value":"number","description":"pg_type.typname: int4"},{"name":"created_at","value":"unknown","description":"pg_type.typname: timestamp"},{"name":"updated_at","value":"unknown","description":"pg_type.typname: timestamp"}],"description":"update users set email = $1, username = $2\n                where email = $3\n                returning *"},{"properties":[{"name":"id","value":"number","description":"pg_type.typname: int4"},{"name":"username","value":"string","description":"pg_type.typname: varchar"},{"name":"email","value":"string","description":"pg_type.typname: varchar"},{"name":"foursquare_id","value":"number","description":"pg_type.typname: int4"},{"name":"created_at","value":"unknown","description":"pg_type.typname: timestamp"},{"name":"updated_at","value":"unknown","description":"pg_type.typname: timestamp"}],"description":"update users set foursquare_id = $1\n            where email = $2\n            returning *"}]