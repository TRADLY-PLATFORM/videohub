import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import * as membershipAPI from '@/api/membership'
import type {
  CreateMembershipInput,
  ListMembershipsParams,
  ListMembershipsResponse,
  Membership,
} from '@/types/subscription.types'

interface LocalState {
  auth: { authKey: string }
}

const getAuthKey = (state: LocalState) => state.auth.authKey

export const membershipApi = createApi({
  reducerPath: 'membershipApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Membership'],
  endpoints: (builder) => ({
    getMemberships: builder.query<ListMembershipsResponse, ListMembershipsParams>({
      queryFn: async (params, { getState }) => {
        const authKey = getAuthKey(getState() as LocalState)
        if (!authKey) return { error: { status: 'CUSTOM_ERROR', error: 'Sign in required' } }
        try {
          const res = await membershipAPI.listMemberships(params, authKey)
          if (res?.error) return { error: { status: 'CUSTOM_ERROR', error: res.error.message } }
          const d = res.data!
          return {
            data: {
              memberships: d.memberships ?? [],
              total: d.pagination?.total ?? 0,
              page: d.pagination?.page ?? 1,
              per_page: d.pagination?.per_page ?? 30,
            },
          }
        } catch (err) {
          return { error: { status: 'CUSTOM_ERROR', error: (err as Error).message } }
        }
      },
      providesTags: ['Membership'],
    }),

    createMembership: builder.mutation<{ membership: Membership }, CreateMembershipInput>({
      queryFn: async (input, { getState }) => {
        const authKey = getAuthKey(getState() as LocalState)
        if (!authKey) return { error: { status: 'CUSTOM_ERROR', error: 'Sign in required' } }
        try {
          const res = await membershipAPI.createMembership(input, authKey)
          if (res?.error) return { error: { status: 'CUSTOM_ERROR', error: res.error.message } }
          return { data: { membership: res.data!.membership } }
        } catch (err) {
          return { error: { status: 'CUSTOM_ERROR', error: (err as Error).message } }
        }
      },
      invalidatesTags: ['Membership'],
    }),
  }),
})

export const { useGetMembershipsQuery, useCreateMembershipMutation } = membershipApi
