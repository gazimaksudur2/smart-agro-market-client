# Admin Components

This directory contains modular, reusable components for the admin dashboard pages.

## Components Overview

### 🏷️ Badge Components (`Badges.jsx`)
Reusable badge components for displaying status, quality, categories, roles, and verification states.

- `StatusBadge` - For product and user status display
- `QualityBadge` - For product quality grades (A, B, C, D)
- `CategoryBadge` - For product categories with emojis
- `RoleBadge` - For user roles (admin, agent, seller, consumer)
- `VerificationBadge` - For user verification status

### 📊 Stats Components (`StatsCards.jsx`)
Statistics card components for displaying key metrics.

- `ProductStatsCards` - Product-specific statistics
- `UserStatsCards` - User-specific statistics

### 🔍 Filter Components (`FiltersPanel.jsx`)
Advanced filter panels with search, filtering, and bulk actions.

- `ProductFiltersPanel` - Product filtering with categories, status, quality
- `UserFiltersPanel` - User filtering with roles and status

### 📋 Data Table Components (`DataTable.jsx`)
Modern, feature-rich data table with sorting, pagination, and selection.

- `DataTable` - Main table component with sorting, selection, loading states
- `Pagination` - Advanced pagination component with page numbers

### 🪟 Modal Components
Modern, interactive modal components with animations and better UX.

#### `ModernModal.jsx`
- `ModernModal` - Base modal with animations, fullscreen toggle, backdrop click
- `ActionButton` - Styled button component with variants and loading states
- `InfoCard` - Colored info cards for organizing content
- `ImageGallery` - Interactive image gallery with thumbnails
- `DetailRow` - Consistent detail display component
- `TabPanel` - Tabbed interface component

#### `ProductModal.jsx`
- `ProductModal` - Complete product details modal with tabs (Overview, Seller, Details)

#### `UserModal.jsx` 
- `UserModal` - Complete user details modal with tabs (Overview, Details, Activity)

## Usage Examples

### Using Badge Components
```jsx
import { StatusBadge, QualityBadge, CategoryBadge } from './components/Badges';

<StatusBadge status="approved" />
<QualityBadge quality="A" />
<CategoryBadge category="rice" />
```

### Using Data Table
```jsx
import { DataTable, Pagination } from './components/DataTable';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'status', title: 'Status', render: (value) => <StatusBadge status={value} /> }
];

<DataTable 
  columns={columns}
  data={data}
  onSort={handleSort}
  selectedItems={selected}
  onSelectionChange={setSelected}
/>
```

### Using Modern Modal
```jsx
import { ModernModal, ActionButton } from './components/ModernModal';

<ModernModal
  isOpen={showModal}
  onClose={closeModal}
  title="Product Details"
  size="xlarge"
  actions={[
    <ActionButton key="save" variant="success" onClick={save}>Save</ActionButton>
  ]}
>
  <TabPanel tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
</ModernModal>
```

## Benefits

1. **Modularity** - Components are broken down into focused, single-responsibility modules
2. **Reusability** - Shared components can be used across different admin pages
3. **Maintainability** - Easier to update and debug individual components
4. **Modern UX** - Enhanced animations, interactions, and visual design
5. **Type Safety** - Better prop validation and documentation
6. **Performance** - Smaller bundle sizes and better tree-shaking

## File Structure

```
components/
├── Badges.jsx           # Status, quality, category, role badges
├── StatsCards.jsx       # Statistics display cards
├── FiltersPanel.jsx     # Search and filter panels
├── DataTable.jsx        # Sortable, selectable data tables
├── ModernModal.jsx      # Base modal and utilities
├── ProductModal.jsx     # Product-specific modal
├── UserModal.jsx        # User-specific modal
├── index.js            # Export all components
└── README.md           # This documentation
``` 