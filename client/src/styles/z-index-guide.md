# Z-Index Hierarchy Guide

This document defines the z-index hierarchy for the application to prevent layering conflicts.

## Z-Index Levels

### Base Layer (0-99)
- **0-49**: Regular content, cards, and basic components
- **50-89**: Search bars, dropdowns, and interactive elements
- **90-99**: Admin sidebar and navigation elements

### Navigation Layer (100-199)
- **100**: Main navbar
- **101**: Hamburger menu button
- **110**: User menu container
- **111**: User dropdown menus
- **150**: Search bar and dropdown results (highest priority in navigation)

### Content Layer (200-499)
- **30**: Category filters (Products page)
- **200-299**: Page-specific overlays and dropdowns
- **300-399**: Product cards, category lists
- **400-499**: Form elements and inputs

### Modal Layer (500-999)
- **500**: Admin modals (order details, user management)
- **600**: Social media modals (stories, posts)
- **700-999**: Reserved for future modal types

### System Layer (1000+)
- **1000**: Confirm modals and critical dialogs
- **1050**: Notifications and alerts
- **1100**: Toast messages (highest priority)

## Component Z-Index Reference

### Navigation Components
- `.navbar`: 100
- `.hamburger`: 101
- `.user-menu-container`: 110
- `.user-dropdown`: 111
- `.modern-search-bar`: 150
- `.search-suggestions-dropdown`: 150

### Modal Components
- `.modal-overlay` (admin): 500
- `.story-modal`: 600
- `.confirm-modal-overlay`: 1000

### Notification Components
- `.notification`: 1050
- `.toast-container`: 1100

### Admin Components
- `.admin-sidebar`: 90

### Page-Specific Components
- `.category-filter-modern`: 30 (Products page)

## Best Practices

1. **Use semantic grouping**: Keep related components in the same z-index range
2. **Leave gaps**: Don't use consecutive numbers to allow for future additions
3. **Document changes**: Update this guide when adding new z-index values
4. **Test interactions**: Ensure modals appear above navigation, notifications above modals
5. **Avoid extreme values**: Don't use values above 9999 unless absolutely necessary

## Common Issues to Avoid

- Navigation elements appearing above modals
- Search dropdowns hidden behind other content
- Toast messages not visible due to modal overlays
- Admin sidebar conflicting with main navigation

## Testing Checklist

When adding new components with z-index:
- [ ] Component appears at correct layer
- [ ] Doesn't interfere with navigation
- [ ] Modals still function properly
- [ ] Toast messages remain visible
- [ ] Mobile responsiveness maintained
