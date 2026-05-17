import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <Navbar setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}