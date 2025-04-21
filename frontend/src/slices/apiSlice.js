import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Job', 'Faculty', 'Department', 'AcademicField', 'Application'],
  endpoints: (builder) => ({}),
});