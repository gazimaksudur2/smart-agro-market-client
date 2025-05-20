import React from 'react';

const ManageAgents = () => {
  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Manage Agents</h1>
        <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <h2 className="text-lg font-medium mb-2">Pending Agents</h2>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ManageAgents;

