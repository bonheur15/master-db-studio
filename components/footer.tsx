// components/footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-aluminum py-8 text-center">
      <div className="container mx-auto">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
        {/* Add any other simple footer content here if needed */}
      </div>
    </footer>
  );
};

export default Footer;
