# Smart Agro Connect Styling Guide

This document explains how to use both the original project styling and DaisyUI components together without conflicts.

## Configuration

The project has been set up with DaisyUI using a prefix approach to prevent conflicts with existing styles:

```js
// tailwind.config.js
module.exports = {
  // ... existing config
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light", "dark"],
    prefix: "daisy-", // This prefixes all daisyUI classes with "daisy-"
    logs: false,
  },
}
```

## Usage Guide

### Using DaisyUI Components

All DaisyUI components must be prefixed with `daisy-`. For example:

```jsx
// Original DaisyUI button
<button className="btn btn-primary">Button</button>

// Prefixed DaisyUI button (correct usage in this project)
<button className="daisy-btn daisy-btn-primary">Button</button>
```

### Common Components

Here's how to use both styling approaches:

#### Buttons

```jsx
// Original project button
<button className="btn btn-primary">Primary Button</button>

// DaisyUI button
<button className="daisy-btn daisy-btn-primary">DaisyUI Button</button>

// Using both (the classes won't conflict)
<button className="btn btn-primary daisy-btn daisy-btn-outline">Mixed Button</button>
```

#### Form Inputs

```jsx
// Original project input
<input className="form-input" />

// DaisyUI input
<input className="daisy-input daisy-input-bordered" />

// Combined approach
<input className="form-input daisy-input daisy-input-bordered" />
```

#### Cards

```jsx
// Original project card
<div className="card">Card content</div>

// DaisyUI card
<div className="daisy-card">
  <div className="daisy-card-body">DaisyUI Card content</div>
</div>
```

### Advanced DaisyUI Components

For components that only exist in DaisyUI (like modals, tabs, etc.), use the prefixed versions:

```jsx
// DaisyUI tabs
<div className="daisy-tabs">
  <a className="daisy-tab daisy-tab-lifted">Tab 1</a> 
  <a className="daisy-tab daisy-tab-lifted daisy-tab-active">Tab 2</a> 
</div>

// DaisyUI modal
<button className="daisy-btn" onClick={() => document.getElementById('my_modal').showModal()}>
  Open Modal
</button>
<dialog id="my_modal" className="daisy-modal">
  <div className="daisy-modal-box">
    <h3>Modal Title</h3>
    <p>Modal content</p>
    <div className="daisy-modal-action">
      <form method="dialog">
        <button className="daisy-btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
```

## Theme Configuration

DaisyUI comes with built-in themes that you can use. The default theme is "light", but you can switch to any of the available themes:

```jsx
// To add a theme switcher to your application
<select 
  data-choose-theme 
  className="daisy-select daisy-select-bordered"
  onChange={(e) => document.documentElement.setAttribute('data-theme', e.target.value)}
>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
  <option value="cupcake">Cupcake</option>
  <option value="forest">Forest</option>
</select>
```

## Example Component

You can refer to the `DaisyUISample.jsx` component in the project for a comprehensive demonstration of using both styling approaches together.

## Best Practices

1. When working with existing components, stick to the original project styling
2. For new components or when you need specific DaisyUI features, use the prefixed classes
3. You can mix both approaches, but be aware of potential style overrides
4. Keep your CSS organized and consistent within each component 
