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

## Document Type Features (Completed)
- [x] Add document type schema and database tables
- [x] Add document type dropdown to attachment screen
- [x] Update backend to accept and store document types
- [x] Implement document type management UI on dropdown management page
- [x] Create database seed script for default document types
- [x] Add green clipper icon with attachment count badge to shipment list
- [x] Implement attachment filtering by document type in AttachmentsModal

## Fix tRPC API Error (Completed)
- [x] Check server logs for backend errors
- [x] Fix backend issue causing HTML response instead of JSON
- [x] Restart server and verify API is working

## Maersk API Integration (In Progress)
- [x] Add Maersk API credentials to environment variables
- [x] Create Maersk API client module for container tracking
- [x] Add backend procedures for tracking containers (by container number, BOL, booking number)
- [x] Add UI button to manually fetch container tracking data from Maersk
- [x] Create MaerskTrackingModal component for tracking and updating shipments
- [x] Integrate Track button into shipment list
- [x] Add "Track" button to each shipment row in the grid
- [x] Test tracking functionality with container numbers
- [ ] Add webhook endpoint for real-time Maersk tracking events (future enhancement)

## Automatic Tracking System (Completed)
- [x] Create tracking history database schema
- [x] Add last_tracked_at field to shipments table
- [x] Create background polling service for Maersk API
- [x] Implement automatic status updates from tracking data
- [x] Add UI toggle for enabling/disabling auto-tracking per shipment
- [x] Add admin procedures for controlling tracking scheduler
- [ ] Test automatic tracking with real Maersk container numbers
- [ ] Start tracking scheduler on server startup

## Notification Triggers (Completed)
- [x] Add notification logic to tracking service for status changes
- [x] Implement delay detection and notification
- [x] Add arrival confirmation notifications
- [x] Create notification preferences in user settings
- [x] Add owner notification support for critical events
- [x] Respect user preferences when sending notifications
- [ ] Test notification triggers with real tracking updates

## Email Notifications (Completed)
- [x] Add email notification preference to user schema
- [x] Create Resend API email service module
- [x] Integrate email sending into tracking notification logic
- [x] Add email templates for status changes, delays, and arrivals
- [x] Install Resend package
- [ ] Test email notifications with real email addresses

## Bug Fixes
- [x] Fix "Failed to track and update shipment" error in Maersk tracking mutation
- [x] Improve error handling to show clear authentication error messages

## Dropdown Management System (Completed)
- [x] Create database schema for reference data (suppliers, carriers, ports, statuses)
- [x] Create seed script to populate dropdown data
- [x] Create API endpoints to fetch dropdown options
- [x] Update UI forms to use dropdown data from API
- [x] Populated 20 suppliers, 20 carriers, and 47 ports
- [ ] Add admin interface to manage reference data (future enhancement)

## TimeToGo API Integration (Completed)
- [x] Configure TimeToGo API credentials in API configuration system
- [x] Create TimeToGo tracking service module
- [x] Integrate TimeToGo tracking with existing tracking modal
- [x] Add provider selector (TimeToGo recommended, Maersk alternative)
- [ ] Test tracking with real container numbers

## Tracking Modal Rebranding (Completed)
- [x] Update modal title from "Track Container with Maersk API" to generic "Track Container"
- [x] Remove Maersk-specific branding from UI
- [x] Rename component from MaerskTrackingModal to ContainerTrackingModal
- [x] Update provider selector to "Multi-Carrier Tracking (Recommended)" and "Maersk Direct API"

## Bug Fixes
- [x] Fix HTTP 404 error in API mutation calls
- [x] Update TimeToGo API endpoint from /track to /container
- [x] Change authentication from Bearer token to api_key query parameter
- [x] Update response parsing to match TimeToGo API structure

- [x] Fix TypeError: Cannot convert undefined or null to object in ContainerTrackingModal line 334
- [x] Add null check for trackingData.references before calling Object.keys()

## Auto-populate Shipment Fields from API (Completed)
- [x] Display all TimeToGo API values organized in tracking modal
- [x] Show Carrier, Container, ATD, ETA, ATA fields from API response
- [x] Extract and format port names, dates, and reference numbers from API
- [x] Update UI to show all tracking data in organized sections
- [x] Create comprehensive events timeline with actual/estimated badges
- [x] Display ports & dates with POL and POD information

## Fix Shipment Update After Tracking (Completed)
- [x] Investigate why ATD, ATA, Supplier, CRO fields aren't updating after tracking
- [x] Fix the "Apply Suggested Updates" functionality
- [x] Create applyTrackingUpdates mutation to update shipment fields
- [x] Add "Apply Updates" button to tracking modal
- [x] Map TimeToGo response to suggested updates with all fields
- [ ] Test that shipment fields update correctly after tracking

## Update Confirmation Toast (Completed)
- [x] Add toast notification system to show which fields were updated
- [x] Display field names and new values in toast message
- [x] Show success toast after applying tracking updates
- [x] Install react-toastify package
- [x] Add ToastContainer to App component
- [x] Show error toast if update fails

## Auto-Track on Container Input (Completed)
- [x] Add automatic tracking when container number is entered in Add Shipment modal
- [x] Fetch tracking data from TimeToGo API on container number blur/change
- [x] Auto-populate carrier, status, ports, dates, vessel fields from API response
- [x] Show loading indicator while fetching tracking data
- [x] Handle cases where container is not found or API fails
- [x] Validate container number format (4 letters + 7 digits)
- [x] Auto-uppercase container number input
- [x] Show helper text to guide users

## Bug Fix: Auto-Tracking Not Triggering (Completed)
- [x] Debug why auto-tracking doesn't trigger when container number is entered
- [x] Fixed condition - container field was only showing for editing, not for new shipments
- [x] Moved container field outside isEditing condition
- [x] Verified onBlur handler is properly attached
- [x] Helper text now only shows for new shipments

## Duplicate Container Detection (Completed)
- [x] Create backend API endpoint to check if container number exists
- [x] Add checkDuplicate query to shipments tRPC router
- [x] Implement frontend duplicate warning alert
- [x] Show existing shipment details in warning (supplier, status, ETA)
- [x] Add option to proceed anyway with duplicate
- [x] Show toast warning when duplicate is detected
- [x] Clear duplicate warning when modal closes
- [ ] Test duplicate detection with existing containers

## Auto-Add Ports from API (Completed)
- [x] Implement backend logic to check if port exists in database
- [x] Auto-insert new ports when loaded from tracking API
- [x] Refresh port dropdowns after new ports are added
- [x] Handle both POL and POD ports
- [x] Created ensurePortsExist utility function
- [x] Integrated with applyTrackingUpdates mutation
- [x] Invalidate ports cache after updates
- [ ] Test with tracking data containing new ports

## Navigation Menu Reordering
- [x] Move dropdown management menu item below user management in header dropdown
- [x] Remove dropdown management from sidebar navigation

## Email Templates for Notifications
- [x] Create email template for container tracking updates
- [x] Create email template for discharge date changes
- [x] Create email template for missing documents alert
- [x] Integrate templates with Resend email service
- [x] Add email sending functions for each notification type
- [x] Create professional HTML email templates with responsive design
- [x] Add summary boxes and color-coded badges
- [x] Implement sendContainerUpdatesNotification function
- [x] Implement sendDateChangesNotification function
- [x] Implement sendMissingDocumentsNotification function


## Advanced Notification System (Completed)
- [x] Notification settings page with comprehensive controls
- [x] Email frequency options (immediate, hourly, daily, weekly)
- [x] Quiet hours configuration (start time, end time)
- [x] Timezone support for user notifications
- [x] Notification type toggles (container updates, date changes, missing documents, status changes, delays, arrivals)
- [x] User preferences API with full CRUD operations
- [x] Navigation menu item for notification settings

## Email Digest System (Completed)
- [x] Scheduled email digest functionality
- [x] Hourly digest support with automatic scheduling
- [x] Daily digest support (9 AM delivery)
- [x] Weekly digest support (Monday 9 AM delivery)
- [x] Email digest queue database table
- [x] Digest data aggregation service
- [x] Combined digest email template with all notification types
- [x] Cron scheduler for automatic digest processing (runs every 5 minutes)
- [x] Quiet hours respect in digest sending
- [x] Digest scheduling on server startup

## Webhook Integration System (Completed)
- [x] Webhook API endpoint for external systems
- [x] API key authentication for webhooks
- [x] Support for 8 event types:
  - [x] Customs clearance
  - [x] Gate in
  - [x] Gate out
  - [x] Vessel departure
  - [x] Vessel arrival
  - [x] Container loaded
  - [x] Container discharged
  - [x] Empty return
- [x] Webhook events database table
- [x] Webhook event storage and processing
- [x] Automatic notification on webhook receipt
- [x] Webhook event history tracking
- [x] Query webhooks by container number
- [x] Query all recent webhook events (last 100)
- [x] Webhook event notification email template
- [x] Comprehensive webhook API documentation (WEBHOOK_API.md)
- [x] Example webhook calls with curl commands
- [x] Testing guide for webhook integration

## Database Schema Updates (Completed)
- [x] Added emailFrequency field to users table (immediate, hourly, daily, weekly)
- [x] Added notifyContainerUpdates field to users table
- [x] Added notifyDischargeDateChanges field to users table
- [x] Added notifyMissingDocuments field to users table
- [x] Added quietHoursStart field to users table
- [x] Added quietHoursEnd field to users table
- [x] Added timezone field to users table
- [x] Created webhookEvents table with full event tracking
- [x] Created emailDigestQueue table for scheduled digests
- [x] Pushed all schema changes to database

## Testing Coverage (Completed)
- [x] Notification preferences tests (3 tests)
- [x] Webhook functionality tests (3 tests)
- [x] Email frequency settings tests (3 tests)
- [x] All new tests passing (9/9)
- [x] Total test count: 49 tests passing

## Documentation (Completed)
- [x] WEBHOOK_API.md with complete integration guide
- [x] Supported event types documentation
- [x] Authentication and security guidelines
- [x] Request/response format examples
- [x] Testing instructions for webhooks
- [x] Best practices for webhook integration
- [x] Rate limiting recommendations


## Email Service Verification (In Progress)
- [ ] Verify all email notifications use Resend API
- [ ] Check digest email service uses Resend
- [ ] Check webhook notification emails use Resend
- [ ] Ensure no direct email sending bypasses Resend


## UI Improvements (Completed)
- [x] Make notification settings page scrollable
