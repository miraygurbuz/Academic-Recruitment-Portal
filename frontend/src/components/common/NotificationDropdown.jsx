import { Dropdown, Badge } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../slices/notificationApiSlice';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { formatNotificationDate } from '../../utils/helpers';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const target = useRef(null);
  
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const { data: unreadData } = useGetUnreadCountQuery();
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id).unwrap();
      } catch (err) {
        toast.error('İşlem gerçekleştirilemedi.');
      }
    }
    
    if (notification.url) {
      navigate(notification.url);
      setShow(false);
    }
  };
  
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', err);
    }
  };
   
  const unreadCount = unreadData?.count || 0;
  
  return (
    <Dropdown show={show} onToggle={(nextShow) => setShow(nextShow)}>
      <Dropdown.Toggle 
        className="mx-2 d-flex align-items-center"
        id="notification-dropdown" 
        ref={target}
        as="div"
        style={{ cursor: 'pointer' }}
      >
        <div className="me-2 position-relative">
          <FaBell />
          {unreadCount > 0 && (
            <Badge 
              pill 
              bg="danger" 
              className="position-absolute"
              style={{ 
                top: '-8px', 
                right: '-8px', 
                fontSize: '0.65rem',
                padding: '0.2rem 0.45rem'
              }}
            >
              {unreadCount > 10 ? '10+' : unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" style={{ minWidth: '320px' }}>
        <div className="d-flex justify-content-between p-2 border-bottom">
          <strong>Bildirimler</strong>
          {unreadCount > 0 && (
            <span 
              onClick={handleMarkAllAsRead}
              style={{ cursor: 'pointer', color: '#198754', fontSize: '0.9rem' }}
            >
              Tümünü okundu işaretle
            </span>
          )}
        </div>
        
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {isLoading ? (
            <div className="text-center p-3">
              <span>Yükleniyor...</span>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center p-3">
              <span>Bildiriminiz bulunmuyor</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <Dropdown.Item 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={notification.isRead ? '' : 'fw-bold'}
                style={{
                    borderBottom: '1px solid #eee',
                    backgroundColor: notification.isRead ? 'white' : '#d1e7dd'
                  }}
              >
                <div>
                  <div className="d-flex justify-content-between">
                    <span>{notification.title}</span>
                    <small className="text-muted ms-2">
                      {formatNotificationDate(notification.createdAt)}
                    </small>
                  </div>
                  <small className="text-muted d-block mt-1">
                    {notification.message}
                  </small>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;