import { apiSlice } from './apiSlice';

const APPLICATIONS_URL = '/api/applications';

const convertToFormData = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'documents' && Array.isArray(data.documents)) {
        data.documents.forEach(file => {
          formData.append('documents', file);
        });
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return formData;
  };

export const applicationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getApplications: builder.query({
            query: (params) => ({
                url: `${APPLICATIONS_URL}/applications`,
                method: 'GET',
                params
            }),
            providesTags: ['Application']
        }),

        getMyApplications: builder.query({
            query: () => ({
                url: `${APPLICATIONS_URL}/my`,
                method: 'GET'
            }),
            providesTags: ['Application']
        }),

        getApplicationById: builder.query({
            query: (id) => ({
                url: `${APPLICATIONS_URL}/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Application', id }]
        }),

        createApplication: builder.mutation({
            query: (formData) => ({
              url: `${APPLICATIONS_URL}`,
              method: 'POST',
              body: formData
            }),
            invalidatesTags: ['Application'],
            async prepareHeaders(headers) {
              headers.delete('Content-Type');
              return headers;
            }
          }),

        updateApplication: builder.mutation({
            query: ({ id, ...data }) => {
                const formData = data instanceof FormData ? data : convertToFormData(data);
                return {
                    url: `${APPLICATIONS_URL}/${id}`,
                    method: 'PUT',
                    body: formData,
                    formData: true
                };
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Application', id }
            ]
        }),

        deleteApplication: builder.mutation({
            query: (id) => ({
                url: `${APPLICATIONS_URL}/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Application', id }
            ]
        }),

        calculateApplicationPoints: builder.query({
            query: (id) => ({
                url: `${APPLICATIONS_URL}/${id}/calculate-points`,
                method: 'GET'
            })
        }),

        checkApplicationCriteria: builder.query({
            query: (id) => ({
                url: `${APPLICATIONS_URL}/${id}/check-criteria`,
                method: 'GET'
            })
        }),
        getJobApplications: builder.query({
            query: (jobId) => ({
                url: `${APPLICATIONS_URL}/by-job/${jobId}`,
                method: 'GET'
            }),
            providesTags: ['Applications']
        }),

        getApplicationPDF: builder.query({
            query: (id) => ({
              url: `${APPLICATIONS_URL}/${id}`,
              params: { includeDetails: true }
            }),
            keepUnusedDataFor: 60,
          }),

        }),
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
    useGetJobApplicationsQuery,
    useGetApplicationPDFQuery
} = applicationsApiSlice;