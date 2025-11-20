import React from 'react';

export const LoadingSkeleton = () => {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      <div className="w-64 border-r border-gray-800 p-4 hidden md:flex flex-col gap-4">
        <div className="h-8 bg-gray-800 rounded animate-pulse w-3/4"></div>
        <div className="space-y-2 mt-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-800 flex items-center px-4">
           <div className="h-6 bg-gray-800 rounded animate-pulse w-48"></div>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-16 w-64 bg-gray-800 rounded-xl animate-pulse"></div>
             </div>
           ))}
        </div>
        <div className="p-4">
          <div className="h-12 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
