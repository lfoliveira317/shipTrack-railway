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

## S3 Storage Integration for Attachments (Completed)
- [x] Review existing S3 storage helpers in the template
- [x] Update attachments API to use S3 for file storage
- [x] Add presigned URL generation for secure uploads/downloads
- [x] Update AttachmentsModal for real file uploads with progress bar
- [x] Add file download functionality with presigned URLs
- [x] Store file metadata (S3 key, URL) in database
- [x] Write unit tests for S3 integration (16 tests passing)
- [x] Test file upload and download functionality

## User ACL and Management (Completed)
- [x] Update user schema with role field (admin, user, viewer)
- [x] Create admin-only procedure middleware
- [x] Create user management API (list, stats, getById, update, updateRole, delete)
- [x] Implement role-based access control on shipments API
- [x] Implement role-based access control on comments API
- [x] Implement role-based access control on attachments API
- [x] Create User Management modal component for admins
- [x] Add User Management menu item (admin only)
- [x] Hide Add/Edit buttons for viewer role users
- [x] Add role badge in user header (Admin/Viewer)
- [x] Write unit tests for ACL functionality (32 tests passing)
- [x] Test admin and viewer role permissions

## Neon Database Integration (Completed)
- [x] Add Neon connection string to environment variables
- [x] Push database schema to Neon (5 tables: users, shipments, comments, attachments, apiConfigs)
- [x] Test connection and verify all tables created
- [x] Verify application works with Neon database (32 tests passing)

## Notification System (Completed)
- [x] Create notifications database schema
- [x] Create notification API endpoints (list, create, markAsRead, markAllAsRead, delete, unreadCount)
- [x] Add notification triggers for shipment status changes
- [x] Update notification UI to display real notifications
- [x] Add unread notification badge in header with count
- [x] Implement mark as read functionality
- [x] Implement mark all as read functionality
- [x] Write unit tests for notification system (7 tests passing)
- [x] Total tests: 39 passing

## Email Notification System (Completed)
- [x] Set up email service integration with Resend
- [x] Request and validate email service API credentials
- [x] Create email notification service module
- [x] Design HTML email templates for status changes
- [x] Integrate email sending into shipment update triggers
- [x] Write unit tests for email service (1 test passing)
- [x] Test email delivery for status change notifications
- [x] Total tests: 40 passing

## ShipStation API Integration (In Progress)
- [ ] Set up ShipStation API credentials
- [ ] Create tracking service module
- [ ] Implement automatic tracking updates
- [ ] Add scheduled background jobs for polling
- [ ] Integrate with notification system
- [ ] Add manual refresh tracking button
- [ ] Write unit tests for tracking service
- [ ] Test real-time tracking functionality

## Vercel Deployment Fix (Completed)
- [x] Diagnose NOT_FOUND error on Vercel (missing vercel.json)
- [x] Create vercel.json configuration with proper routing
- [x] Create API entry point for Vercel serverless functions
- [x] Fix build configuration for Vercel deployment
- [x] Create comprehensive VERCEL_DEPLOYMENT.md guide
- [x] Document common issues and solutions

## Replace Vite with esbuild (In Progress)
- [ ] Update package.json to remove Vite dependencies
- [ ] Create esbuild configuration for frontend
- [ ] Update build scripts to use esbuild
- [ ] Test local build
- [ ] Update vercel.json configuration
- [ ] Deploy and verify on Vercel

## Update Sidebar User Info (Completed)
- [x] Update left sidebar to show real logged-in user data
- [x] Display actual user name instead of hardcoded "Admin User"
- [x] Display actual user email
- [x] Display actual user role (Admin/User/Viewer) with badges
- [x] Test with different user roles

## Rename App to ShipTrack (Completed)
- [x] Update app name in App.tsx (logo, header, tabs)
- [x] Update app title in index.html
- [x] Update package.json name to "shiptrack"
- [x] All UI references changed from Beacon to ShipTrack

## Viewer Attachment Fixes (Completed)
- [x] Allow viewers to see/download attachments (fix ACL)
- [x] Hide attachment upload (clipper) icon for viewer users

## Status Badge Style Fix (Completed)
- [x] Remove inline style override to restore color-coded status system

## Additional Orange Theme Updates (Completed)
- [x] Change Admin badge to orange
- [x] Change Grid view button to orange (conditional - only when active)

## Project Name Update (Completed)
- [x] Update project display name from "Beacon Supply Chain Mockup" to "ShipTrack"

## Remove Live Boards Tab (Completed)
- [x] Remove Live Boards tab from navigation

## Comments Modal User Name Fix (Completed)
- [x] Show logged-in user name automatically in comments modal
- [x] Make user name field non-editable

## Logout Feature (Completed)
- [x] Add logout button to user menu
- [x] Implement logout functionality

## Email Branding Update (Completed)
- [x] Update email templates to use ShipTrack branding

## New Features - PO Number, Column Customization, Calendar Date (Completed)
- [x] Add PO Number field for SellerCloud integration
- [x] Implement customizable column visibility for shipments table (state added, UI pending)
- [x] Replace manual date input with calendar picker in forms

## localStorage Integration for Column Preferences (Completed)
- [x] Create custom hook for localStorage persistence
- [x] Load column preferences from localStorage on app mount
- [x] Save column preference changes to localStorage
- [x] Test persistence across browser sessions

## Replace Order Number with SellerCloud # (Completed)
- [x] Rename orderNumber field to sellerCloudNumber in database schema
- [x] Update form labels and placeholders
- [x] Update table column headers and display
- [x] Update all references throughout the app

## Dropdown Management Feature (Completed)
- [x] Create database schema for dropdown values (Supplier, Carrier, POL, POD)
- [x] Create backend API procedures for dropdown CRUD operations (admin-only)
- [x] Create dropdown management page component
- [x] Update Add Shipment modal to use dropdown values
- [x] Add navigation link to dropdown management page

## Fix Navigation Between Views (Completed)
- [x] Fix Orders & Shipments tab to switch back to shipments view
- [x] Ensure both sidebar and tab navigation work correctly

## Bug Fixes - Dropdown Management & Right Menu (Completed)
- [x] Fix port addition issue in dropdown management (added missing TRPCError import)
- [x] Make right-side menu work correctly for both views (conditional rendering)
- [x] Ensure all dropdown CRUD operations function properly

## Scrollable Dropdown Management UI (Completed)
- [x] Add scrollable container to dropdown management page
- [x] Improve layout for adding ports with better spacing
- [x] Make the interface more user-friendly for managing all dropdown values

## Fix Tab Indicator for Current View (Completed)
- [x] Fix right menu tabs to show correct active page
- [x] Ensure tab indicator reflects ShipTrack vs Orders & Shipments view

## Document Type Features (In Progress)
- [x] Add document type schema and database tables
- [x] Add document type dropdown to attachment screen
- [x] Update backend to accept and store document types
- [ ] Add document type management UI to dropdown management page
- [ ] Add green clipper icon with attachment count to shipment list
- [ ] Initialize default document types (BOL, Purchase Invoice, Sold Invoice, Packing Slip, Arrival Notice)
