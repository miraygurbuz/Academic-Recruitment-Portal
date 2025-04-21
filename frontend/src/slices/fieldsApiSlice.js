import { apiSlice } from './apiSlice';

const FACULTIES_URL = '/api/faculties';
const DEPARTMENTS_URL = '/api/departments';
const ACADEMIC_FIELDS_URL = '/api/academic-fields';

export const facultiesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFaculties: builder.query({
            query: () => ({
                url: FACULTIES_URL,
                method: 'GET'
            }),
            providesTags: ['Faculty']
        }),
        
        getFacultyById: builder.query({
            query: (id) => ({
                url: `${FACULTIES_URL}/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Faculty', id }]
        }),
        
        createFaculty: builder.mutation({
            query: (data) => ({
                url: FACULTIES_URL,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Faculty']
        }),
        
        updateFaculty: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${FACULTIES_URL}/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Faculty', id }, 'Faculty']
        }),
        
        deleteFaculty: builder.mutation({
            query: (id) => ({
                url: `${FACULTIES_URL}/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Faculty']
        }),

        getFacultiesByAcademicField: builder.query({
            query: (academicFieldId) => `${FACULTIES_URL}/academic-fields/${academicFieldId}/faculties`,
            providesTags: (result, error, academicFieldId) => [
                { type: 'Faculty', id: academicFieldId }
            ]
        }),
    })
});

export const departmentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDepartments: builder.query({
            query: () => ({
                url: DEPARTMENTS_URL,
                method: 'GET'
            }),
            providesTags: ['Department']
        }),
        
        getDepartmentById: builder.query({
            query: (id) => ({
                url: `${DEPARTMENTS_URL}/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Department', id }]
        }),
        
        getDepartmentsByFaculty: builder.query({
            query: (facultyId) => ({
                url: `${DEPARTMENTS_URL}/faculty/${facultyId}`,
                method: 'GET'
            }),
            providesTags: ['Department']
        }),
        
        createDepartment: builder.mutation({
            query: (data) => ({
                url: DEPARTMENTS_URL,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Department']
        }),
        
        updateDepartment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${DEPARTMENTS_URL}/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }, 'Department']
        }),
        
        deleteDepartment: builder.mutation({
            query: (id) => ({
                url: `${DEPARTMENTS_URL}/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Department']
        })
    })
});

export const academicFieldsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAcademicFields: builder.query({
            query: () => ({
                url: ACADEMIC_FIELDS_URL,
                method: 'GET'
            }),
            providesTags: ['AcademicField']
        }),
        
        getAcademicFieldById: builder.query({
            query: (id) => ({
                url: `${ACADEMIC_FIELDS_URL}/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'AcademicField', id }]
        }),
        
        createAcademicField: builder.mutation({
            query: (data) => ({
                url: ACADEMIC_FIELDS_URL,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['AcademicField']
        }),
        
        updateAcademicField: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${ACADEMIC_FIELDS_URL}/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'AcademicField', id }, 'AcademicField']
        }),
        
        deleteAcademicField: builder.mutation({
            query: (id) => ({
                url: `${ACADEMIC_FIELDS_URL}/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['AcademicField']
        })
    })
});

export const {
    useGetFacultiesQuery,
    useGetFacultyByIdQuery,
    useCreateFacultyMutation,
    useUpdateFacultyMutation,
    useDeleteFacultyMutation,
    useGetFacultiesByAcademicFieldQuery,
} = facultiesApiSlice;

export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useGetDepartmentsByFacultyQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation
} = departmentsApiSlice;

export const {
    useGetAcademicFieldsQuery,
    useGetAcademicFieldByIdQuery,
    useCreateAcademicFieldMutation,
    useUpdateAcademicFieldMutation,
    useDeleteAcademicFieldMutation
} = academicFieldsApiSlice;