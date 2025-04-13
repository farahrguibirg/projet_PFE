// components/Card.js
'use client';

import Link from 'next/link';

export default function Card({ href, icon: Icon, title, description }) {
  return (
    <Link href={href}>
      <div className="card">
        <div className="card-icon-container">
          <Icon className="card-icon" />
        </div>
        <h2 className="card-title">{title}</h2>
        {description && <p className="text-gray-500 mt-2">{description}</p>}
      </div>
    </Link>
  );
}