# TimeToGo API Response Structure

## Key Fields for Shipment Updates

### Summary Object
- `summary.origin.location` - Origin location ID
- `summary.pol.location` - Port of Loading location ID
- `summary.pol.date` - ATD (Actual Time of Departure) - "2026-01-08T00:00:00"
- `summary.pod.location` - Port of Discharge location ID  
- `summary.pod.date` - ETA (Estimated Time of Arrival) - "2026-03-09T00:00:00"
- `summary.destination.location` - Destination location ID
- `summary.company.full_name` - Carrier name - "Mediterranean Shipping Company (MSC)"

### Container Object
- `container.number` - Container number - "MSDU8368827"
- `container.type` - Container type - "40' HIGH CUBE"
- `container.events[]` - Array of tracking events

### Events Array
Each event has:
- `location` - Location ID (maps to locations array)
- `terminal` - Terminal ID (maps to terminals array)
- `status` - Human readable status - "Export Loaded on Vessel"
- `status_code` - Status code - "CLL"
- `date` - Event date - "2026-01-08T00:00:00"
- `actual` - Boolean - true if actual, false if estimated
- `vessel` - Vessel name - "MSC JEONGMIN"
- `voyage` - Voyage number - "NL552R"

### Locations Array
- `id` - Location ID
- `name` - Location name - "MERSIN"
- `locode` - UN/LOCODE - "TRMER"
- `country_iso_code` - Country code - "TR"

### Terminals Array
- `id` - Terminal ID
- `name` - Terminal name - "MERSIN INTERNATIONAL PORT"

### Shipment Status
- `shipment_status` - Overall status - "IN_TRANSIT"

## Mapping to Shipment Fields

- **Supplier**: Not in API (keep existing)
- **CRO**: Not in API (keep existing)
- **Carrier**: `summary.company.full_name`
- **Container Number**: `container.number`
- **Container Type**: `container.type`
- **Port of Loading**: Look up location name from `summary.pol.location`
- **Port of Discharge**: Look up location name from `summary.pod.location`
- **ATD**: `summary.pol.date` (Actual Time of Departure)
- **ETA**: `summary.pod.date` (Estimated Time of Arrival)
- **ATA**: Find latest actual event at POD location
- **Status**: Map `shipment_status` to our status values
- **Vessel Name**: Get from most recent actual event
- **Voyage Number**: Get from most recent actual event

## Status Mapping
- "IN_TRANSIT" → "in_transit"
- "DELIVERED" → "delivered"
- "PENDING" → "pending"
