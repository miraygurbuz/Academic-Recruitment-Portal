import { apiSlice } from './apiSlice';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/api/notifications',
      keepUnusedDataFor: 5,
      providesTags: ['Notification']
    }),
    
    getUnreadCount: builder.query({
      query: () => '/api/notifications/unread-count',
      keepUnusedDataFor: 5,
      providesTags: ['NotificationCount']
    }),
    
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification', 'NotificationCount']
    }),
    
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/api/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification', 'NotificationCount']
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApiSlice;