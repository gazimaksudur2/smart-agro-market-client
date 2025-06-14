import React from 'react';

const DaisyUISample = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">DaisyUI and Custom Styling Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Regular buttons vs DaisyUI buttons */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Buttons</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Project Buttons:</h4>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary">Primary Button</button>
                <button className="btn btn-outline">Outline Button</button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">DaisyUI Buttons:</h4>
              <div className="flex flex-wrap gap-2">
                <button className="daisy-btn daisy-btn-primary">DaisyUI Primary</button>
                <button className="daisy-btn daisy-btn-secondary">DaisyUI Secondary</button>
                <button className="daisy-btn daisy-btn-accent">DaisyUI Accent</button>
                <button className="daisy-btn daisy-btn-ghost">DaisyUI Ghost</button>
                <button className="daisy-btn daisy-btn-link">DaisyUI Link</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Regular cards vs DaisyUI cards */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Card Styles</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Project Card:</h4>
              <div className="card p-4">
                <h5 className="font-bold">Regular Card</h5>
                <p>This uses the current project's card styling</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">DaisyUI Cards:</h4>
              <div className="daisy-card daisy-card-bordered daisy-bg-base-100">
                <div className="daisy-card-body">
                  <h5 className="daisy-card-title">DaisyUI Card</h5>
                  <p>This uses DaisyUI's card styling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form elements */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Form Elements</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Project Inputs:</h4>
              <div className="space-y-2">
                <input type="text" className="form-input w-full" placeholder="Regular input" />
                <select className="form-input w-full">
                  <option>Regular select option</option>
                </select>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">DaisyUI Inputs:</h4>
              <div className="space-y-2">
                <input type="text" className="daisy-input daisy-input-bordered w-full" placeholder="DaisyUI input" />
                <select className="daisy-select daisy-select-bordered w-full">
                  <option>DaisyUI select option</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alerts and notifications */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Alerts</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Project Alerts:</h4>
              <div className="bg-primary-50 text-primary-700 p-4 rounded-lg">
                This is a regular alert
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">DaisyUI Alerts:</h4>
              <div className="daisy-alert daisy-alert-info mb-2">
                <span>DaisyUI Info Alert</span>
              </div>
              <div className="daisy-alert daisy-alert-success mb-2">
                <span>DaisyUI Success Alert</span>
              </div>
              <div className="daisy-alert daisy-alert-warning mb-2">
                <span>DaisyUI Warning Alert</span>
              </div>
              <div className="daisy-alert daisy-alert-error">
                <span>DaisyUI Error Alert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced components */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Advanced DaisyUI Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h4 className="text-sm font-medium mb-2">DaisyUI Tabs:</h4>
            <div className="daisy-tabs">
              <a className="daisy-tab daisy-tab-lifted">Tab 1</a> 
              <a className="daisy-tab daisy-tab-lifted daisy-tab-active">Tab 2</a> 
              <a className="daisy-tab daisy-tab-lifted">Tab 3</a>
            </div>
          </div>
          
          <div className="card p-6">
            <h4 className="text-sm font-medium mb-2">DaisyUI Modal (Button Only):</h4>
            <button className="daisy-btn" onClick={() => document.getElementById('my_modal_1').showModal()}>
              Open Modal
            </button>
            <dialog id="my_modal_1" className="daisy-modal">
              <form method="dialog" className="daisy-modal-box">
                <h3 className="font-bold text-lg">Hello!</h3>
                <p className="py-4">This is a DaisyUI modal</p>
                <div className="daisy-modal-action">
                  <button className="daisy-btn">Close</button>
                </div>
              </form>
            </dialog>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Usage Instructions</h3>
        <p className="mb-2">To use DaisyUI components alongside existing styles:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All DaisyUI components are prefixed with <code className="bg-gray-100 px-1 rounded">daisy-</code></li>
          <li>For example: <code className="bg-gray-100 px-1 rounded">daisy-btn</code> instead of <code className="bg-gray-100 px-1 rounded">btn</code></li>
          <li>You can continue using existing project styling without conflicts</li>
          <li>The prefix is set in <code className="bg-gray-100 px-1 rounded">tailwind.config.js</code></li>
        </ul>
      </div>
    </div>
  );
};

export default DaisyUISample; 
