/* eslint-disable */
// tslint:disable
// this file is generated by a tool; don't change it manually.

export type ListRecord_AllTypes = [
  {
    /** pg_type.typname: varchar */
    user_id: string
    /** pg_type.typname: varchar */
    list_id: string
    /** pg_type.typname: text */
    location: string
    /** pg_type.typname: float4 */
    lat: unknown
    /** pg_type.typname: float4 */
    lon: unknown
  },
    {
    /** pg_type.typname: text */
    location: string
    /** pg_type.typname: float4 */
    lat: unknown
    /** pg_type.typname: float4 */
    lon: unknown
  }
]
export interface ListRecord_QueryTypeMap {
  [`select * from user_lists
          where user_id = $1
          order by list_id desc`]: ListRecord_AllTypes[0]
  [`select location, lat, lon from user_lists
          where user_id = $1
          order by list_id desc`]: ListRecord_AllTypes[1]
}

export type ListRecord_UnionType = ListRecord_QueryTypeMap[keyof ListRecord_QueryTypeMap]

export type ListRecord = {
  [K in keyof ListRecord_UnionType]: ListRecord_UnionType[K]
}
export const ListRecord = {} as ListRecord

export const ListRecord_meta_v0 = [{"properties":[{"name":"user_id","value":"string","description":"pg_type.typname: varchar"},{"name":"list_id","value":"string","description":"pg_type.typname: varchar"},{"name":"location","value":"string","description":"pg_type.typname: text"},{"name":"lat","value":"unknown","description":"pg_type.typname: float4"},{"name":"lon","value":"unknown","description":"pg_type.typname: float4"}],"description":"select * from user_lists\n        where user_id = $1\n        order by list_id desc"},{"properties":[{"name":"location","value":"string","description":"pg_type.typname: text"},{"name":"lat","value":"unknown","description":"pg_type.typname: float4"},{"name":"lon","value":"unknown","description":"pg_type.typname: float4"}],"description":"select location, lat, lon from user_lists\n        where user_id = $1\n        order by list_id desc"}]