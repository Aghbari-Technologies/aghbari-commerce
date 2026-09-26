# Aghbari Commerce — UI Reference Asset Index

> Canonical drop-zone for visual references that the implementation team must use when matching the Aghbari Commerce UI.
> Project identity: **الأغبري | Aghbari Commerce**.

## 1. Purpose

ضع هنا الصور والملفات المرجعية التي تريد أن تُبنى الواجهات على أساسها. هذه المراجع تُستخدم كـ **مصدر بصري مباشر** عند تنفيذ أو مطابقة:

- Admin / Staff Dashboard
- Customer Portal / Storefront
- Catalog, Product Details, Cart, Quick Order, Reorder
- Orders, Invoices, Payments, Statements
- Inventory, Warehouses, Transfers, Stock Count
- Suppliers, Purchasing, Receiving
- Roles, Permissions, Import / Export, Invitations
- Audit / Outbox / operational states
- Navigation, dialogs, drawers, forms, tables, filters, responsive states

## 2. Where to add reference assets

Use this directory structure when uploading files:

```text
docs/ui-reference/
├── UI-REFERENCE-ASSET-INDEX.md        # this file
├── admin/
│   ├── dashboard/
│   ├── catalog/
│   ├── orders/
│   ├── inventory/
│   ├── purchasing/
│   ├── finance/
│   ├── customers/
│   ├── staff/
│   └── settings/
├── customer/
│   ├── storefront/
│   ├── catalog/
│   ├── product/
│   ├── cart/
│   ├── quick-order/
│   ├── orders/
│   ├── finance/
│   └── account/
├── shared/
│   ├── navigation/
│   ├── components/
│   ├── modals/
│   ├── tables/
│   ├── forms/
│   └── responsive/
└── source-files/
    ├── pdf/
    ├── figma-export/
    ├── html/
    └── notes/
```

**ارفع الصور الأصلية والملفات المرجعية كما هي، ويفضل عدم ضغطها أو قصها أو إعادة تحجيمها.**

## 3. Naming convention

Use stable names so each reference can be mapped to one implementation target:

```text
<area>__<screen>__<state>__<viewport>__<sequence>.<ext>
```

Examples:

```text
admin__dashboard__default__desktop__01.png
admin__orders__details__desktop__01.png
admin__orders__empty__desktop__01.png
admin__catalog__product-detail__mobile__01.png
customer__storefront__home__desktop__01.png
customer__quick-order__validation-error__mobile__01.png
shared__table__filters__tablet__01.png
```

## 4. Reference mapping

| Reference file | Target route / surface | Viewport | State | Matching priority | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | Add rows as files are uploaded |

Priority meanings:

- **P0** = exact visual source; must be matched before considering the surface complete.
- **P1** = strong visual reference; preserve hierarchy, spacing, density and interaction model.
- **P2** = supporting reference; use for components or states only.

## 5. What must be matched

For every P0/P1 reference, compare the implementation against the source for:

1. Page composition and information hierarchy.
2. RTL layout, alignment and reading order.
3. Typography scale, weights, line-height and truncation.
4. Spacing rhythm, container widths and grid density.
5. Colors, borders, radii, shadows and surfaces.
6. Navigation, tabs, breadcrumbs and selected states.
7. Tables, filters, search, sorting and pagination.
8. Forms, validation, loading, empty, success and error states.
9. Dialogs, drawers, confirmations and destructive-action treatment.
10. Responsive behavior across desktop, tablet and mobile.
11. Keyboard focus, hover/active/disabled states and accessibility affordances.
12. Real application data shape and interaction behavior where the reference implies it.

## 6. Source-of-truth rule

When a reference is marked **P0**, do not replace its visual structure with a generic component merely because the generic component is easier to implement.

The implementation should reproduce the reference's **visual hierarchy and interaction intent** while preserving Aghbari's real backend contracts, permissions, tenant isolation and transactional rules.

Do not copy:

- logos, trademarks or proprietary brand assets from unrelated products into Aghbari;
- secrets, credentials, tokens or private customer data;
- Report-Advisor / Report-Engainall application logic or transaction models.

## 7. Completion evidence

A visual surface is not considered matched solely because the route renders.

The final verification for a reference-backed screen should capture:

- reference image;
- implementation screenshot;
- route;
- viewport;
- relevant state;
- exact source commit SHA.

Keep the evidence tied to the exact commit that was tested. Do not transfer PASS evidence between different SHAs.

## 8. Upload instruction

### For images

Place them under the closest matching folder above and add one row to the **Reference mapping** table.

### For supporting files

Place PDFs, HTML exports, design exports, annotations or specification files under `source-files/` and record what screen(s) they govern.

### For a multi-screen pack

Create a dedicated subfolder, for example:

```text
docs/ui-reference/admin/catalog/product-management-pack/
```

and add a short note in the mapping table identifying the primary screen and related states.

## 9. Current target

The purpose of this directory is to drive **Aghbari Commerce / الأغبري** toward high-fidelity visual implementation. Existing functional work and backend contracts remain authoritative; uploaded references determine the intended visual target and interaction detail for the affected surfaces.
