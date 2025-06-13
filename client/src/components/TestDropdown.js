import React, { useState } from 'react';

const TestDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 99999 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 20px',
          background: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Test Dropdown ({isOpen ? 'OPEN' : 'CLOSED'})
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          background: 'yellow',
          border: '2px solid red',
          padding: '20px',
          minWidth: '200px',
          marginTop: '5px'
        }}>
          <div>This is a test dropdown!</div>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default TestDropdown;
