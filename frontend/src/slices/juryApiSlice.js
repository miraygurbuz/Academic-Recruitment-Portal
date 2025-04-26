import { apiSlice } from './apiSlice';

const JOBS_URL = '/api/jobs';
const APPLICATIONS_URL = '/api/applications';

export const juryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJuryAssignedJobs: builder.query({
      query: () => ({
        url: `${JOBS_URL}/jury/assigned`,
        method: 'GET',
      }),
      keepUnusedDataFor: 5,
    }),
    
    getJuryJobApplications: builder.query({
      query: (jobId) => ({
        url: `${APPLICATIONS_URL}/jury/job/${jobId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 5,
    }),
    
    getJuryApplicationDetails: builder.query({
      query: (applicationId) => ({
        url: `${APPLICATIONS_URL}/jury/${applicationId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 5,
    }),

    getJuryApplicationPDF: builder.query({
      query: (applicationId) => ({
        url: `${APPLICATIONS_URL}/jury/${applicationId}`,
        params: { includeDetails: true }
      }),
      keepUnusedDataFor: 60,
    }),
    
    evaluateApplication: builder.mutation({
      query: ({ applicationId, evaluation }) => ({
        url: `${APPLICATIONS_URL}/jury/${applicationId}/evaluate`,
        method: 'POST',
        body: evaluation,
        formData: true,
      }),
      invalidatesTags: ['Application']
    }),
  
    updateEvaluation: builder.mutation({
      query: ({ applicationId, evaluation }) => ({
        url: `${APPLICATIONS_URL}/jury/${applicationId}/evaluate`,
        method: 'PUT',
        body: evaluation,
        formData: true,
      }),
      invalidatesTags: ['Application']
    }),
  }),
});

export const {
  useGetJuryAssignedJobsQuery,
  useGetJuryJobApplicationsQuery,
  useGetJuryApplicationDetailsQuery,
  useEvaluateApplicationMutation,
  useUpdateEvaluationMutation,
  useGetJuryApplicationPDFQuery
} = juryApiSlice;