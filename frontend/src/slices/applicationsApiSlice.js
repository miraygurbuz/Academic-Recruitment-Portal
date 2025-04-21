import { apiSlice } from './apiSlice';

export const applicationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getApplications: builder.query({
            query: (params) => ({
                url: '/api/applications/applications',
                method: 'GET',
                params
            }),
            providesTags: ['Application']
        }),

        getMyApplications: builder.query({
            query: () => ({
                url: '/api/applications/my',
                method: 'GET'
            }),
            providesTags: ['Application']
        }),

        getApplicationById: builder.query({
            query: (id) => ({
                url: `/api/applications/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Application', id }]
        }),

        createApplication: builder.mutation({
            query: (newApplication) => ({
                url: '/api/applications',
                method: 'POST',
                body: newApplication
            }),
            invalidatesTags: ['Application']
        }),

        updateApplication: builder.mutation({
            query: ({ id, ...updatedApplication }) => ({
                url: `/api/applications/${id}`,
                method: 'PUT',
                body: updatedApplication
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Application', id }
            ]
        }),

        deleteApplication: builder.mutation({
            query: (id) => ({
                url: `/api/applications/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Application', id }
            ]
        }),

        calculateApplicationPoints: builder.query({
            query: (id) => ({
                url: `/api/applications/${id}/calculate-points`,
                method: 'GET'
            })
        }),

        checkApplicationCriteria: builder.query({
            query: (id) => ({
                url: `/api/applications/${id}/check-criteria`,
                method: 'GET'
            })
        }),
        getJobApplications: builder.query({
            query: (jobId) => ({
                url: `/api/applications/by-job/${jobId}`,
                method: 'GET'
            }),
            providesTags: ['Applications']
        }),
    })
});

export const {
    useGetApplicationsQuery,
    useGetMyApplicationsQuery,
    useGetApplicationByIdQuery,
    useCreateApplicationMutation,
    useUpdateApplicationMutation,
    useDeleteApplicationMutation,
    useCalculateApplicationPointsQuery,
    useCheckApplicationCriteriaQuery,
    useGetJobApplicationsQuery
} = applicationsApiSlice;