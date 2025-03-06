import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'
import { tagTypes } from './tagTypes'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000'
})

const baseQueryWithReauth = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: {}
) => {
  const result = await baseQuery(args, api, extraOptions)
  return result
}

const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: () => ({})
})

export default api
