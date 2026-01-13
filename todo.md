# Project TODO

## Completed Features
- [x] Basic homepage layout
- [x] Navigation menu with sidebar
- [x] Responsive design (mobile/tablet/desktop)
- [x] Full-stack upgrade with backend API
- [x] JSON file storage for shipments
- [x] Basic New Shipment modal form
- [x] Unit tests for shipments API

## Advanced Features (Completed)
- [x] Enhanced Add/Update modal with Ocean/Air shipments tabs
- [x] Container numbers vs BoL numbers tabs in modal
- [x] File upload option for spreadsheet import (UI ready)
- [x] Bulk paste text area for container numbers
- [x] Spreadsheet-style grid view with all columns
- [x] Additional columns: CRO, MAWB number, ATD, ATA, Order Number
- [x] View options: Grid, List, Calendar, Globe icons
- [x] Action icons per row: attachments, comments
- [x] Email notification settings panel
- [x] Filter button (placeholder)
- [x] Share button (placeholder)
- [x] Email alert button (placeholder)
- [x] Bulk shipment API endpoint
- [x] Updated unit tests for new schema

## New Requirements (Completed)
- [x] Remove Live Boards, Plan, Report, Team navigation items
- [x] Simplify sidebar to show only Orders & Shipments
- [x] Implement functional filters to sort grid by columns
- [x] Add sort by Order Number
- [x] Add sort by Supplier
- [x] Add sort by Status
- [x] Add sort by Carrier
- [x] Add sort by ETA
- [x] Enhance mobile responsiveness for grid
- [x] Optimize tablet view for better usability
- [x] Add search functionality across all shipment fields
- [x] Add mobile search bar for better UX

## Style Restoration (Completed)
- [x] Restore original Swiss Style design system
- [x] Add Signal Orange accent color (#FF5722)
- [x] Restore proper Bootstrap styling and spacing
- [x] Ensure typography matches original design
- [x] Maintain functional improvements (filters, sorting, search)
- [x] Import Bootstrap CSS properly in main.tsx

## Responsive Enhancement (Completed)
- [x] Make table horizontally scrollable on mobile
- [x] Optimize toolbar button layout for small screens
- [x] Improve touch targets for mobile devices (44px minimum)
- [x] Add responsive breakpoints for better tablet view
- [x] Optimize font sizes for mobile readability
- [x] Ensure proper spacing on all screen sizes
- [x] Add touch-friendly scrolling for mobile
- [x] Implement responsive padding adjustments

## Bootstrap Card Enhancement (Completed)
- [x] Wrap main data grid in Bootstrap card
- [x] Add card shadows and borders for depth
- [x] Enhance toolbar with card header styling
- [x] Improve visual hierarchy with card components
- [x] Add proper spacing between card elements
- [x] Add hover effects for better interactivity
- [x] Implement rounded corners for modern look

## Status Color-Coding (Completed)
- [x] Implement color-coded status badges
- [x] Add green for delivered/arrived status
- [x] Add blue for in-transit status
- [x] Add yellow/orange for pending status
- [x] Add red for delayed/issues status
- [x] Add gray for cancelled/on-hold status
- [x] Create status color mapping function
- [x] Apply Bootstrap variant colors (success, primary, warning, danger, secondary, info)

## Grid Scrolling Enhancement (Completed)
- [x] Improve horizontal scrolling behavior
- [x] Add smooth scroll for better UX
- [x] Ensure table is fully scrollable on mobile
- [x] Add visual scroll indicators (custom scrollbar)
- [x] Optimize scroll performance with -webkit-overflow-scrolling
- [x] Remove conflicting inline styles
- [x] Add custom scrollbar styling for better visibility

## Sticky Table Header (Completed)

- [x] Implement sticky header that stays fixed during vertical scroll
- [x] Ensure header maintains proper styling when sticky
- [x] Add shadow effect when header is stuck
- [x] Maintain horizontal scroll sync between header and body
- [x] Test on mobile and desktop devices
- [x] Set max-height for scrollable area
- [x] Add responsive adjustments for mobile

## Shipment Comments Feature (Completed)
- [x] Create comments data structure (separate comments.json file)
- [x] Add backend API endpoints for comments (list, add, delete)
- [x] Create comments modal component
- [x] Display comment count badge on each row
- [x] Add new comment form with timestamp
- [x] Show comment author and date
- [x] Integrate with shipment action buttons
- [x] Write unit tests for comments API (6 tests passing)

## File Attachments Feature (Completed)
- [x] Create attachments backend API (JSON file storage)
- [x] Implement upload attachment endpoint
- [x] Implement list attachments by shipment endpoint
- [x] Implement delete attachment endpoint
- [x] Create AttachmentsModal component
- [x] Display attachment count badge on paperclip icon
- [x] Show file list with name, size, and date
- [x] Add file upload form
- [x] Write unit tests for attachments API (6 tests passing)

## Edit Shipment Feature (Completed)
- [x] Create update shipment backend endpoint
- [x] Create getById shipment backend endpoint
- [x] Reuse AddShipmentModal for editing (with editingShipment prop)
- [x] Add edit button (pencil icon) to Actions column
- [x] Pre-populate form with existing shipment data
- [x] Handle form submission and data update
- [x] Refresh grid after successful edit
- [x] Write unit tests for update endpoint (4 new tests)

## CSV Export Feature (Completed)
- [x] Implement CSV generation function
- [x] Add export button functionality with Download icon
- [x] Include all visible columns in export
- [x] Apply current filters/sort to export
- [x] Generate downloadable CSV file
- [x] Add proper CSV formatting (escape commas, quotes)
- [x] Auto-generate filename with date

## Total Test Count: 22 tests passing
- auth.logout.test.ts: 1 test
- comments.test.ts: 6 tests
- shipments.test.ts: 9 tests
- attachments.test.ts: 6 tests

## UI Color Consistency (Completed)
- [x] Change "In transit" status badge color from orange to cyan/info
- [x] Ensure consistent styling across all application components
- [x] Differentiate status colors from app's primary orange theme
- [x] Added color mapping for additional statuses (Loaded, Gated, Departed)

## Theme Color Update (Completed)
- [x] Replace red theme color with orange throughout the app
- [x] Update Beacon logo/branding to orange (#FF5722)
- [x] Change order number links from red to orange
- [x] Update In transit status badge to orange/warning
- [x] Ensure consistent orange theme across all components
- [x] Updated tab underline to orange

## Remaining Red Elements Fixed (Completed)
- [x] Admin avatar circle changed to orange
- [x] Notification badge changed to orange
- [x] Add button changed to orange
- [x] Done button in notifications modal changed to orange
- [x] Comment count badges changed to orange
- [x] Sidebar user avatar changed to orange

## API Configuration Modal (Completed)
- [x] Create backend API endpoints for configuration management
- [x] Create JSON storage for API configurations
- [x] Build configuration modal component with checkbox options
- [x] Add single API option for all shipments
- [x] Add per-carrier API option with dropdown (MSC, etc.)
- [x] Include fields: URL, Port, Token, User, Password
- [x] Save configuration to separate JSON file
- [x] Write unit tests for configuration endpoints (6 tests passing)

## Attachment Visualization (Completed)
- [x] Add preview/view option for attachments
- [x] Support image preview (jpg, png, gif, etc.)
- [x] Support PDF preview placeholder
- [x] Add download button for all files
- [x] Add eye icon to view/preview attachments
- [x] Display file metadata in preview (size, type, uploader, date)
- [x] Full-screen preview modal for better viewing experience

## Remove Air Shipments (Completed)
- [x] Remove air shipments option from Add button dropdown
- [x] Remove air shipment notification from notifications modal
- [x] Ensure only ocean/container shipments are supported
- [x] Simplified AddShipmentModal to ocean-only mode

## Migrate to PostgreSQL Database (Completed)
- [x] Create database schema for shipments table
- [x] Create database schema for attachments table
- [x] Create database schema for comments table
- [x] Create database schema for API configuration table
- [x] Push schema changes to database
- [x] Update shipments API to use PostgreSQL
- [x] Update attachments API to use PostgreSQL
- [x] Update comments API to use PostgreSQL
- [x] Update API configuration to use PostgreSQL
- [x] Update routers to use new API structure
- [x] Update frontend types to use numeric IDs
- [x] Fix remaining TypeScript errors in frontend
- [x] Update unit tests for database integration (13 tests passing)
- [x] Test all functionality with database
- [x] Remove JSON file storage dependencies
