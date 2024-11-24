'use client';

import React from 'react';
import { FolderIcon, CircleArrowLeft } from 'lucide-react';
import Link from 'next/link';


const FolderRow = () => {
  const folders = [
    { id: '65020979', name: '65020979' },
    { id: '65020980', name: '65020980' },
    { id: '65020981', name: '65020981' },
    { id: '65020982', name: '65020982' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="p-6">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-xl">software engineer</h1>
          <Link href="./addclass">
            <button className="text-white hover:bg-slate-700 p-2 rounded-full transition-colors">
              <CircleArrowLeft />
            </button>
          </Link>
        </div>

        {/* Folder Row with Horizontal Scroll */}
        <div className="flex space-x-8 overflow-x-auto pb-4">
          {folders.map((folder) => (
            <div 
              key={folder.id} 
              className="flex flex-col items-center flex-shrink-0"
            >
              <div className="text-blue-500 hover:text-blue-400 cursor-pointer mb-2 transition-colors">
                <FolderIcon size={64} />
              </div>
              <span className="text-white text-sm">{folder.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FolderRow;