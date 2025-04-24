import { apiSlice } from './apiSlice';

const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST'
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                body: data,
            }),
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data,
            }),
        }),
        getUserProfile: builder.query({
            query: () => ({
                url: `${USERS_URL}/profile`,
                method: 'GET'
            }),
        }),
        getUsers: builder.query({
            query: () => ({
                url: `${USERS_URL}`,
                method: 'GET'
            }),
            providesTags: ['User']
        }),
        updateUserRole: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${USERS_URL}/${id}/role`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['User']
        }),
        getJuryMembersByDepartment: builder.query({
            query: (departmentId) => ({
              url: `${USERS_URL}/jurymembers/department/${departmentId}`,
              method: 'GET'
            }),
            providesTags: ['JuryMember']
          })
    })
})

export const { 
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useUpdateUserMutation,
    useGetUserProfileQuery,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useGetJuryMembersByDepartmentQuery } = usersApiSlice;