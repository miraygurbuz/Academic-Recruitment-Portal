import React from 'react';
import amblem from '/src/assets/amblem.svg';

const Amblem = ({ size = 30 }) => {
    return (
        <img 
            src={amblem} 
            alt='Amblem' 
            style={{ width: size, height: size, objectFit: 'contain' }}
        />
    );
};

export default Amblem;