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


data

Here’s a set of dummy but realistic data for agents on your platform based on the provided regions:

---

### 1. Tangail, Dhaka

**Business Name:** Tangail Logistics Solutions
**Business Type:** Logistics & Freight Forwarding
**Experience:** 8 years
**Business License URL:** [www.tangail-logistics.com/license](http://www.tangail-logistics.com/license)
**Bank Account Details:** ABC Bank, Tangail Branch, Account Number: 123-456-789
**Warehouse Address:** 47, Main Road, Tangail Town, Dhaka
**Warehouse Size:** 2000 sq ft
**Warehouse Images (URL):** [www.tangail-logistics.com/warehouse.jpg](http://www.tangail-logistics.com/warehouse.jpg)
**Coverage Area Descriptions:** Serving all of Tangail District with regional connections to nearby districts.
**References:** ABC Transport Company (contact: 01XXXXXXXXXX), XYZ Retailers (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** I want to expand my business reach, improve delivery systems, and work with a reputable platform to increase customer satisfaction.

---

### 2. Chapainawabganj, Rajshahi

**Business Name:** Chapai Warehouse & Distribution
**Business Type:** Warehousing & Distribution Services
**Experience:** 6 years
**Business License URL:** [www.chapaiwarehouse.com/license](http://www.chapaiwarehouse.com/license)
**Bank Account Details:** Rajshahi Bank, Chapainawabganj Branch, Account Number: 987-654-321
**Warehouse Address:** 12, Rajshahi Road, Chapainawabganj, Rajshahi
**Warehouse Size:** 1500 sq ft
**Warehouse Images (URL):** [www.chapaiwarehouse.com/warehouse.jpg](http://www.chapaiwarehouse.com/warehouse.jpg)
**Coverage Area Descriptions:** Covering Chapainawabganj and adjacent regions such as Naogaon and Rajshahi.
**References:** Rajshahi Freight Solutions (contact: 01XXXXXXXXXX), Green Valley Traders (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** Looking to broaden market access, improve delivery efficiency, and create new business opportunities through collaboration.

---

### 3. Sylhet, Sylhet

**Business Name:** Sylhet Cargo & Storage
**Business Type:** Freight Forwarding & Warehousing
**Experience:** 5 years
**Business License URL:** [www.sylhetcargo.com/license](http://www.sylhetcargo.com/license)
**Bank Account Details:** Sylhet Bank, Sylhet City Branch, Account Number: 555-111-222
**Warehouse Address:** 92, Airport Road, Sylhet City, Sylhet
**Warehouse Size:** 1800 sq ft
**Warehouse Images (URL):** [www.sylhetcargo.com/warehouse.jpg](http://www.sylhetcargo.com/warehouse.jpg)
**Coverage Area Descriptions:** Servicing Sylhet city and surrounding areas including Moulvibazar, Habiganj, and Sunamganj.
**References:** Sylhet Trucking Co. (contact: 01XXXXXXXXXX), North East Exporters (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** To offer more reliable and efficient logistics solutions to clients and enhance my business presence in the region.

---

### 4. Cumilla, Chattagram

**Business Name:** Cumilla Logistics & Warehousing
**Business Type:** Supply Chain Solutions & Warehousing
**Experience:** 7 years
**Business License URL:** [www.cumillalogistics.com/license](http://www.cumillalogistics.com/license)
**Bank Account Details:** Chattogram Bank, Cumilla Branch, Account Number: 432-987-654
**Warehouse Address:** 25, Jhautala, Cumilla City, Chattagram
**Warehouse Size:** 2500 sq ft
**Warehouse Images (URL):** [www.cumillalogistics.com/warehouse.jpg](http://www.cumillalogistics.com/warehouse.jpg)
**Coverage Area Descriptions:** Covering Cumilla, Chandpur, and nearby areas including parts of Chattogram.
**References:** Chattogram Freight Co. (contact: 01XXXXXXXXXX), Cumilla Traders Association (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** I want to enhance the logistics network and offer better service coverage to local businesses through a trusted platform.

---

### 5. Bagerhat, Khulna

**Business Name:** Bagerhat Warehousing & Transport
**Business Type:** Warehousing & Transportation Services
**Experience:** 4 years
**Business License URL:** [www.bagerhatwarehousing.com/license](http://www.bagerhatwarehousing.com/license)
**Bank Account Details:** Khulna Bank, Bagerhat Branch, Account Number: 321-654-987
**Warehouse Address:** 11, Ghat Road, Bagerhat, Khulna
**Warehouse Size:** 1200 sq ft
**Warehouse Images (URL):** [www.bagerhatwarehousing.com/warehouse.jpg](http://www.bagerhatwarehousing.com/warehouse.jpg)
**Coverage Area Descriptions:** Covering Bagerhat, Khulna, and surrounding regions.
**References:** Khulna Logistic Partners (contact: 01XXXXXXXXXX), Bagerhat Distributors Ltd. (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** To increase my market presence and improve customer satisfaction by being part of a robust, data-driven platform.

---

### 6. Patuakhali, Barishal

**Business Name:** Patuakhali Logistics & Warehouse Solutions
**Business Type:** Logistics, Warehousing & Inventory Management
**Experience:** 3 years
**Business License URL:** [www.patuakhali-logistics.com/license](http://www.patuakhali-logistics.com/license)
**Bank Account Details:** Barishal Bank, Patuakhali Branch, Account Number: 654-321-987
**Warehouse Address:** 56, Coastal Road, Patuakhali, Barishal
**Warehouse Size:** 1400 sq ft
**Warehouse Images (URL):** [www.patuakhali-logistics.com/warehouse.jpg](http://www.patuakhali-logistics.com/warehouse.jpg)
**Coverage Area Descriptions:** Serving Patuakhali, Barishal, and nearby regions like Bhola and Jhalokathi.
**References:** Coastal Freight Co. (contact: 01XXXXXXXXXX), Patuakhali Retailers (contact: 01XXXXXXXXXX)
**Why do you want to become an agent of our platform?** To scale up my operations and benefit from the platform’s growth-focused infrastructure and customer base.

---

Let me know if you need any adjustments!
