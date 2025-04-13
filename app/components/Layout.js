'use client';
import Sidebar from './sidebar';
import Navbar from './Navbar';

export default function Layout({ children, title }) {
  return (
    <div className="flex min-h-screen relative">
      <div className="sidebar-container">
        <Sidebar className="sidebar" />
      </div>
      <div className="main-content flex-1 overflow-auto">
        <Navbar />
        <div className="p-6">
          <h1 className="title-page text-left underline text-2xl font-semibold mb-4">{title}</h1>
          <main className="main-content-main">{children}</main>
        </div>
      </div>
    </div>
  );
}