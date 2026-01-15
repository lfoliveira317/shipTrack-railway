# Webhook API Documentation

## Overview

ShipTrack provides webhook endpoints that allow external systems (carriers, terminals, customs brokers, etc.) to push real-time container events directly into the system. When events are received, ShipTrack automatically:

1. Stores the event in the database
2. Links it to the corresponding shipment (if found)
3. Sends immediate notifications to users (in-app and email)
4. Updates tracking history

## Authentication

All webhook requests must include an API key for authentication.

**API Key**: `shiptrack-webhook-key-2024` (default)

To change the API key, set the `WEBHOOK_API_KEY` environment variable.

## Endpoint

```
POST /api/trpc/webhooks.receiveEvent
```

## Request Format

The webhook endpoint uses tRPC format. Send a POST request with the following JSON body:

```json
{
  "containerNumber": "MSDU8368827",
  "eventType": "customs_clearance",
  "eventData": {
    "clearanceDate": "2024-01-15T10:30:00Z",
    "customsOffice": "Los Angeles Customs",
    "status": "cleared",
    "referenceNumber": "CUS-2024-001234"
  },
  "source": "US Customs System",
  "apiKey": "shiptrack-webhook-key-2024"
}
```

## Supported Event Types

| Event Type | Description |
|------------|-------------|
| `customs_clearance` | Container cleared customs |
| `gate_in` | Container entered terminal gate |
| `gate_out` | Container left terminal gate |
| `vessel_departure` | Vessel departed from port |
| `vessel_arrival` | Vessel arrived at port |
| `container_loaded` | Container loaded onto vessel |
| `container_discharged` | Container discharged from vessel |
| `empty_return` | Empty container returned |
| `other` | Other event types |

## Request Parameters

### Required Fields

- **containerNumber** (string): The container number (e.g., "MSDU8368827")
- **eventType** (string): One of the supported event types listed above
- **eventData** (object): Key-value pairs containing event-specific data
- **apiKey** (string): Authentication API key

### Optional Fields

- **source** (string): Name of the system sending the webhook (e.g., "Maersk API", "Terminal System")

## Event Data

The `eventData` object can contain any custom fields relevant to your event. Common fields include:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "location": "Los Angeles, CA",
  "terminal": "APM Terminal",
  "vessel": "MAERSK ESSEX",
  "voyage": "424E",
  "status": "completed",
  "referenceNumber": "REF-12345",
  "notes": "Additional information"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Webhook event received and processed"
}
```

### Error Response

```json
{
  "error": {
    "message": "Invalid API key",
    "code": "UNAUTHORIZED"
  }
}
```

## Example Webhook Calls

### Example 1: Customs Clearance

```bash
curl -X POST https://your-shiptrack-domain.com/api/trpc/webhooks.receiveEvent \
  -H "Content-Type: application/json" \
  -d '{
    "containerNumber": "MSDU8368827",
    "eventType": "customs_clearance",
    "eventData": {
      "clearanceDate": "2024-01-15T10:30:00Z",
      "customsOffice": "Los Angeles Customs",
      "status": "cleared",
      "referenceNumber": "CUS-2024-001234"
    },
    "source": "US Customs System",
    "apiKey": "shiptrack-webhook-key-2024"
  }'
```

### Example 2: Gate In Event

```bash
curl -X POST https://your-shiptrack-domain.com/api/trpc/webhooks.receiveEvent \
  -H "Content-Type: application/json" \
  -d '{
    "containerNumber": "MSDU8368827",
    "eventType": "gate_in",
    "eventData": {
      "gateInTime": "2024-01-15T14:20:00Z",
      "terminal": "APM Terminal",
      "truckNumber": "TRK-5678",
      "driverName": "John Smith"
    },
    "source": "Terminal Management System",
    "apiKey": "shiptrack-webhook-key-2024"
  }'
```

### Example 3: Vessel Departure

```bash
curl -X POST https://your-shiptrack-domain.com/api/trpc/webhooks.receiveEvent \
  -H "Content-Type: application/json" \
  -d '{
    "containerNumber": "MSDU8368827",
    "eventType": "vessel_departure",
    "eventData": {
      "departureTime": "2024-01-16T08:00:00Z",
      "vessel": "MAERSK ESSEX",
      "voyage": "424E",
      "port": "Los Angeles",
      "nextPort": "Oakland"
    },
    "source": "Carrier System",
    "apiKey": "shiptrack-webhook-key-2024"
  }'
```

## Testing Webhooks

You can test webhook integration using the tRPC client in your browser console:

```javascript
// In browser console on ShipTrack app
const result = await window.trpc.webhooks.receiveEvent.mutate({
  containerNumber: "TEST1234567",
  eventType: "gate_in",
  eventData: {
    timestamp: new Date().toISOString(),
    terminal: "Test Terminal",
    status: "completed"
  },
  source: "Test System",
  apiKey: "shiptrack-webhook-key-2024"
});

console.log(result);
```

## Notification Behavior

When a webhook event is received:

1. **Immediate Notifications**: Users with "immediate" email frequency will receive an email notification right away
2. **Digest Notifications**: Users with hourly/daily/weekly digests will have the event included in their next scheduled digest
3. **In-App Notifications**: All users receive an in-app notification regardless of email settings
4. **Quiet Hours**: Email notifications respect user-configured quiet hours

## Viewing Webhook Events

### Get Events for a Container

```javascript
const events = await trpc.webhooks.getEventsByContainer.query({
  containerNumber: "MSDU8368827"
});
```

### Get All Recent Events

```javascript
const allEvents = await trpc.webhooks.getAllEvents.query();
// Returns last 100 events
```

## Best Practices

1. **Include Timestamps**: Always include timestamp information in eventData
2. **Provide Source**: Specify the source system for better tracking
3. **Use Descriptive Event Data**: Include all relevant information in eventData
4. **Handle Errors**: Implement retry logic for failed webhook calls
5. **Secure Your API Key**: Store the API key securely and rotate it periodically
6. **Test First**: Test webhooks in a development environment before production

## Rate Limits

Currently, there are no rate limits on webhook endpoints. However, we recommend:

- Maximum 1000 requests per minute per container
- Batch events when possible
- Implement exponential backoff for retries

## Support

For webhook integration support or to request additional event types, please contact the ShipTrack development team.

## Changelog

### Version 1.0 (January 2024)
- Initial webhook API release
- Support for 8 event types
- Email and in-app notifications
- Event history tracking
