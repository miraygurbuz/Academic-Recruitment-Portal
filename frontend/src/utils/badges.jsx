import { Badge } from 'react-bootstrap';

export const getStatusBadge = (status, className = '') => {
  let bg = 'secondary';
  
  switch (status) {
    case 'Beklemede':
      bg = 'warning';
      break;
    case 'Onaylandı':
      bg = 'success';
      break;
    case 'Reddedildi':
      bg = 'danger';
      break;
    case 'Aktif':
      bg = 'success';
      break;
    case 'Biten':
      bg = 'secondary';
      break;
    default:
      bg = 'dark';
  }
  
  return <Badge bg={bg} className={className}>{status || 'Bilinmeyen'}</Badge>;
};

export const getPositionBadge = (position, className = '') => {
  let bg = 'dark';
  
  switch (position) {
    case 'Profesör':
      bg = 'danger';
      break;
    case 'Doçent':
      bg = 'info';
      break;
    case 'Dr. Öğr. Üyesi':
      bg = 'primary';
      break;
    case 'Araş. Gör.':
      bg = 'success';
      break;
    case 'Öğr. Gör.':
      bg = 'warning';
      break;
    default:
      bg = 'dark';
  }
  
  return <Badge bg={bg} className={className}>{position || 'Bilinmeyen'}</Badge>;
};

export const getRoleBadge = (role, className = '') => {
  let bg = 'secondary';
  
  switch (role) {
    case 'Admin':
      bg = 'primary';
      break;
    case 'Yönetici':
      bg = 'danger';
      break;
    case 'Jüri Üyesi':
      bg = 'dark';
      break;
    case 'Aday':
      bg = 'success';
      break;
    default:
      bg = 'secondary';
  }
  
  return <Badge bg={bg} className={className}>{role || 'Rol Mevcut Değil'}</Badge>;
};