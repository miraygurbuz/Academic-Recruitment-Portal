import { apiSlice } from './apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserCount: builder.query({
      query: () => '/api/users/count',
      transformResponse: (response) => response.count,
      providesTags: ['User'],
    }),
  }),
});

export const jobApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveJobCount: builder.query({
      query: () => '/api/jobs/active/count',
      transformResponse: (response) => response.count,
      providesTags: ['Job'],
    }),
  }),
});

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationCount: builder.query({
      query: () => '/api/applications/count',
      transformResponse: (response) => response.count,
      providesTags: ['Application'],
    }),
    getPendingApplicationCount: builder.query({
      query: () => '/api/applications/pending/count',
      transformResponse: (response) => response.count,
      providesTags: ['Application'],
    }),
  }), 
})

export const { useGetUserCountQuery } = userApiSlice;
export const { useGetActiveJobCountQuery } = jobApiSlice;
export const {
  useGetApplicationCountQuery,
  useGetPendingApplicationCountQuery
} = applicationsApiSlice;