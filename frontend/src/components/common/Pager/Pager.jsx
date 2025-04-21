import { Pagination } from 'react-bootstrap';
import './Pager.css';

const Pager = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  variant = 'success'
}) => {
  const maxVisiblePages = 5;
  
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const visiblePageNumbers = getVisiblePageNumbers();
  
  if (totalPages === 0) return null;
  
  return (
    <div className='d-flex justify-content-center mt-4'>
      <Pagination className={`pagination-${variant}`}>
        {currentPage > 1 && totalPages > maxVisiblePages && (
          <Pagination.First onClick={() => onPageChange(1)} />
        )}
        
        <Pagination.Prev 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        
        {visiblePageNumbers.map(pageNumber => (
          <Pagination.Item 
            key={pageNumber} 
            active={currentPage === pageNumber}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Pagination.Item>
        ))}
        
        <Pagination.Next 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        
        {currentPage < totalPages && totalPages > maxVisiblePages && (
          <Pagination.Last onClick={() => onPageChange(totalPages)} />
        )}
      </Pagination>
    </div>
  );
};

export default Pager;