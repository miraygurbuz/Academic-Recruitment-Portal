import { apiSlice } from './apiSlice';

const JOBS_URL = '/api/jobs';

export const jobsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getJobs: builder.query({
            query: () => ({
                url: JOBS_URL,
                method: 'GET'
            }),
            providesTags: ['Job']
        }),

        getActiveJobs: builder.query({
            query: () => ({
                url: `${JOBS_URL}/active`,
                method: 'GET'
            }),
            providesTags: ['Job']
        }),

        getJobById: builder.query({
            query: (id) => ({
                url: `${JOBS_URL}/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Job', id }]
        }),

        getJobsByDepartment: builder.query({
            query: (departmentId) => ({
                url: `${JOBS_URL}/department/${departmentId}`,
                method: 'GET'
            }),
            providesTags: ['Job']
        }),

        createJob: builder.mutation({
            query: (data) => ({
                url: JOBS_URL,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Job']
        }),

        updateJob: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${JOBS_URL}/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Job', id }, 'Job']
        }),

        updateJobStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `${JOBS_URL}/${id}/status`,
                method: 'PATCH',
                body: { status }
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Job', id }, 'Job']
        }),

        deleteJob: builder.mutation({
            query: (id) => ({
                url: `${JOBS_URL}/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Job']
        }),

        getJobJuryMembers: builder.query({
            query: (id) => ({
              url: `${JOBS_URL}/${id}/jurymembers`,
              method: 'GET'
            }),
            providesTags: ['JobJury']
          }),
          
          assignJuryMembers: builder.mutation({
            query: ({ id, juryMemberIds }) => ({
              url: `${JOBS_URL}/${id}/jurymembers`,
              method: 'PUT',
              body: { juryMemberIds }
            }),
            invalidatesTags: ['JobJury', 'Job']
          }),

          clearJuryMembers: builder.mutation({
            query: (id) => ({
              url: `${JOBS_URL}/${id}/jurymembers`,
              method: 'DELETE'
            }),
          }),
    })
});

export const {
    useGetJobsQuery,
    useGetActiveJobsQuery,
    useGetJobByIdQuery,
    useGetJobsByDepartmentQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useUpdateJobStatusMutation,
    useDeleteJobMutation,
    useGetJobJuryMembersQuery,
    useAssignJuryMembersMutation,
    useClearJuryMembersMutation
} = jobsApiSlice;