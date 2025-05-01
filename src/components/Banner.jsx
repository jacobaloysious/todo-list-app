import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Banner = ({ message, type = 'info', onDismiss }) => {
  return (
    <div className={`banner banner-${type}`}>
      <span className="banner-message">{message}</span>
      {onDismiss && (
        <button className="banner-dismiss" onClick={onDismiss}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default Banner; 