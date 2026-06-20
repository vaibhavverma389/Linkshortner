import React from 'react';
import { Link2 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link2 size={28} className="float-animation" style={{ color: '#d946ef' }} />
        <span>LinkShort</span>
      </div>
      <span className="badge">MERN Stack</span>
    </nav>
  );
};

export default Navbar;
