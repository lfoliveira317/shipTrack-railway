-- =====================================================
-- BEACON SHIPMENT TRACKING - DATABASE EXPORT
-- Generated: 2026-01-13T22:55:01.863Z
-- PostgreSQL Format
-- =====================================================

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Total records: 1

INSERT INTO users (id, open_id, name, email, avatar, role, is_owner, is_collaborator, created_at)
VALUES (1, 'o92rUq6wa7S2hEa2xqwnnL', 'Uphilljuggler7 Cod', 'uphilljuggler7@gmail.com', NULL, 'admin', NULL, NULL, '2026-01-10T18:21:19.000Z');

-- =====================================================
-- SHIPMENTS TABLE
-- =====================================================
-- Total records: 70

INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (1, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Cotton', 'ocean', 'Chittagong', 'Savannah', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (2, '', 'Supplier A', '', NULL, '', 'Carrier A', 'In transit', '', 'Mon, 20 Jan', '', '', 'ocean', 'Shanghai', 'Los Angeles', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (3, '', 'Supplier B', '', NULL, '', 'Carrier B', 'In transit', '', 'Tue, 21 Jan', '', '', 'ocean', 'Hong Kong', 'New York', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (4, '', 'Test Supplier Inc', '', NULL, '', 'Test Carrier', 'In transit', '', 'Mon, 15 Jan', '', '', 'ocean', 'Chittagong', 'Savannah', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (5, '', 'Supplier A', '', NULL, '', 'Carrier A', 'In transit', '', 'Mon, 20 Jan', '', '', 'ocean', 'Shanghai', 'Los Angeles', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (6, '', 'Supplier B', '', NULL, '', 'Carrier B', 'In transit', '', 'Tue, 21 Jan', '', '', 'ocean', 'Hong Kong', 'New York', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (7, 'PO-BULK-001', 'Bulk Supplier', '', NULL, '', 'Bulk Carrier', 'In transit', '', 'Mon, 20 Jan', '', 'Bulk Order 1', 'ocean', 'Singapore', 'Seattle', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (8, 'PO-BULK-002', 'Bulk Supplier', '', NULL, '', 'Bulk Carrier', 'In transit', '', 'Tue, 21 Jan', '', 'Bulk Order 2', 'ocean', 'Singapore', 'Seattle', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (9, 'PO-UNIQUE-001', 'Supplier A', '', NULL, '', 'Carrier A', 'In transit', '', 'Mon, 20 Jan', '', 'Unique Item 1', 'ocean', 'Shanghai', 'Los Angeles', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (10, 'PO-UNIQUE-002', 'Supplier B', '', NULL, '', 'Carrier B', 'In transit', '', 'Tue, 21 Jan', '', 'Unique Item 2', 'ocean', 'Hong Kong', 'New York', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:02:18.000Z', '2026-01-13T16:02:18.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (11, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (12, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (13, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (14, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (15, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (16, 'PO-UPDATE-001', 'Updated Supplier', NULL, NULL, NULL, 'Original Carrier', 'Delivered', NULL, 'Mon, 20 Jan', NULL, 'Updated Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z', '2026-01-13T16:14:37.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (18, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (19, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (20, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (21, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (22, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (23, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z', '2026-01-13T16:19:30.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (25, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (26, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (27, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (28, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (29, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (30, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (31, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (32, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z', '2026-01-13T16:35:16.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (34, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (35, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (36, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (37, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (38, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (39, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (40, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (41, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z', '2026-01-13T16:35:38.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (43, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (44, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (45, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (46, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (47, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (48, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (49, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (50, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z', '2026-01-13T16:36:00.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (52, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (53, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (54, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (55, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (56, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (57, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (58, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (60, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z', '2026-01-13T17:04:48.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (61, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (62, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (63, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (64, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (65, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (66, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (67, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (68, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z', '2026-01-13T17:12:32.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (70, 'PO-TEST-001', 'Test Supplier Inc', 'CRO-TEST-001', NULL, 'MAWB123456', 'Test Carrier', 'In transit', 'Mon, 13 Jan', 'Mon, 15 Jan', '', 'Test Product', 'ocean', 'Test Port A', 'Test Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (71, 'PO-BULK-001', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Bulk Product 1', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (72, 'PO-BULK-002', 'Bulk Supplier', NULL, NULL, NULL, 'Bulk Carrier', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Bulk Product 2', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (73, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (74, 'PO-UNIQUE-001', 'Supplier A', NULL, NULL, NULL, 'Carrier A', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Product A', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (75, NULL, NULL, NULL, NULL, NULL, 'Test Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, NULL, 'ocean', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (76, 'PO-UNIQUE-002', 'Supplier B', NULL, NULL, NULL, 'Carrier B', 'In transit', NULL, 'Tue, 21 Jan', NULL, 'Product B', 'ocean', 'Port C', 'Port D', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');
INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)
VALUES (77, 'PO-UPDATE-001', 'Original Supplier', NULL, NULL, NULL, 'Original Carrier', 'In transit', NULL, 'Mon, 20 Jan', NULL, 'Original Label', 'ocean', 'Port A', 'Port B', NULL, NULL, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z', '2026-01-13T17:30:29.000Z');

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
-- Total records: 15

INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (1, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:14:37.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (2, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:17:26.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (3, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:19:30.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (4, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (5, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:35:16.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (6, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (7, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:35:38.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (8, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (9, 1, undefined, NULL, NULL, NULL, '2026-01-13T16:36:00.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (10, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (11, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:04:48.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (12, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (13, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:12:32.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (14, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z');
INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)
VALUES (15, 1, undefined, NULL, NULL, NULL, '2026-01-13T17:30:29.000Z');

-- =====================================================
-- ATTACHMENTS TABLE
-- =====================================================
-- Total records: 22

INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (1, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T16:14:37.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (2, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T16:19:30.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (3, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T16:19:30.000Z', 'attachments/shipment-1/1768321170721-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768321170721-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (4, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T16:19:31.000Z', 'attachments/shipment-1/1768321170950-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768321170950-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (6, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T16:35:16.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (7, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T16:35:16.000Z', 'attachments/shipment-1/1768322116245-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322116245-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (8, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T16:35:16.000Z', 'attachments/shipment-1/1768322116444-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322116444-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (10, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T16:35:38.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (11, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T16:35:38.000Z', 'attachments/shipment-1/1768322138710-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322138710-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (12, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T16:35:39.000Z', 'attachments/shipment-1/1768322138920-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322138920-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (14, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T16:36:00.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (15, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T16:36:00.000Z', 'attachments/shipment-1/1768322160716-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322160716-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (16, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T16:36:01.000Z', 'attachments/shipment-1/1768322160916-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768322160916-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (18, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T17:04:48.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (19, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T17:04:48.000Z', 'attachments/shipment-1/1768323888366-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768323888366-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (20, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T17:04:48.000Z', 'attachments/shipment-1/1768323888579-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768323888579-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (22, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T17:12:32.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (23, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T17:12:32.000Z', 'attachments/shipment-1/1768324352770-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768324352770-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (24, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T17:12:33.000Z', 'attachments/shipment-1/1768324352957-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768324352957-download-test.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (26, 1, 'test-file.pdf', 1024, 'application/pdf', 'Test User', '2026-01-13T17:30:29.000Z', NULL, NULL);
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (27, 1, 'test-upload.txt', 13, 'text/plain', 'Test User', '2026-01-13T17:30:29.000Z', 'attachments/shipment-1/1768325429390-test-upload.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768325429390-test-upload.txt');
INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)
VALUES (28, 1, 'download-test.txt', 17, 'text/plain', 'Test User', '2026-01-13T17:30:29.000Z', 'attachments/shipment-1/1768325429546-download-test.txt', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031711053/MhzwHgR8AejWKvAATctNq9/attachments/shipment-1/1768325429546-download-test.txt');

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
-- Total records: 2

INSERT INTO notifications (id, user_id, type, title, message, shipment_id, is_read, created_at)
VALUES (2, 1, 'test', 'Test', 'Test', NULL, 1, '2026-01-13T17:12:32.000Z');
INSERT INTO notifications (id, user_id, type, title, message, shipment_id, is_read, created_at)
VALUES (4, 1, 'test', 'Test', 'Test', NULL, 0, '2026-01-13T17:30:29.000Z');

-- =====================================================
-- API CONFIGS TABLE
-- =====================================================
-- Total records: 0


-- =====================================================
-- EXPORT COMPLETE
-- =====================================================
