import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import './Footer.css'; // Ensure you have a CSS file for additional styling
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-media">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebookF as IconProp} />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter as IconProp} />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram as IconProp} />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedinIn as IconProp} />
          </a>
        </div>
        <div className="body-text">
          <p>
            Made with <FontAwesomeIcon icon={faHeart as IconProp} style={{ color: 'red' }} /> by SITEM
          </p>
          <p>&copy; 2024 SITEM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// Add an empty export statement to ensure the file is treated as a module
export {};
