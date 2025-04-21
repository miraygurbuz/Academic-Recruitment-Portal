const Footer = () => {
 return (
   <footer className='footer text-center py-2' style={{ fontSize: '14px', backgroundColor: '#e9e6e2' }}>
     <div className='container'>
       <div className='row'>
         <div className='col-12'>
           <p className='m-0 text-muted'>Akademik Başvuru Sistemi</p>
         </div>
       </div>
       <div className='row'>
         <div className='col-12 d-flex justify-content-center'>
           <a href='https://www.kocaeli.edu.tr/' className='text-muted mx-2'>Ana Sayfa</a>
           <a href='https://www.kocaeli.edu.tr/duyurular' className='text-muted mx-2'>Duyurular</a>
           <a href='https://www.kocaeli.edu.tr/iletisim' className='text-muted mx-2'>İletişim</a>
         </div>
       </div>
     </div>
     <div className='text-center mt-3' style={{ fontSize: '12px', color: '#888' }}>
       <small>© {new Date().getFullYear()}</small>
     </div>
   </footer>
 );
};

export default Footer;