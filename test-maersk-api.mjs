import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const clientId = process.env.MAERSK_CLIENT_ID;
const clientSecret = process.env.MAERSK_CLIENT_SECRET;
const environment = process.env.MAERSK_ENVIRONMENT || 'sandbox';

console.log('\n=== Maersk API Connection Test ===\n');
console.log('Configuration:');
console.log(`- Environment: ${environment}`);
console.log(`- Client ID: ${clientId ? clientId.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`- Client Secret: ${clientSecret ? '***' + clientSecret.substring(clientSecret.length - 4) : 'NOT SET'}`);
console.log('');

if (!clientId || !clientSecret) {
  console.error('❌ ERROR: MAERSK_CLIENT_ID or MAERSK_CLIENT_SECRET not set');
  console.error('Please configure these environment variables in your project settings.');
  process.exit(1);
}

const baseURL = environment === 'production'
  ? 'https://api.maersk.com'
  : 'https://api-sandbox.maersk.com';

const tokenEndpoint = `${baseURL}/oauth2/access_token`;

console.log(`Testing connection to: ${baseURL}\n`);

// Test 1: OAuth2 Authentication
console.log('Test 1: OAuth2 Authentication');
console.log('Attempting to get access token...');

try {
  const response = await axios.post(
    tokenEndpoint,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    {
      headers: {
        'Consumer-Key': clientId,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  console.log('✅ Authentication successful!');
  console.log(`- Access token received: ${response.data.access_token.substring(0, 20)}...`);
  console.log(`- Token type: ${response.data.token_type}`);
  console.log(`- Expires in: ${response.data.expires_in} seconds`);
  console.log('');

  // Test 2: API Request with a sample container number
  console.log('Test 2: Sample Tracking Request');
  console.log('Attempting to track a test container...');

  const accessToken = response.data.access_token;
  
  // Use a common test container number for sandbox
  const testContainerNumber = 'TEMU1234567';
  
  const trackingPayload = {
    clientKey: `TEST_${testContainerNumber}_${Date.now()}`,
    sourceSystem: 'EXTERNAL_SYSTEM',
    dataObjectSource: 'MANUAL',
    references: [
      {
        referenceType: 'CONTAINER_NUMBER',
        referenceValue: testContainerNumber,
      },
    ],
    shipmentJourneyLegs: [
      {
        legSequenceNumber: 1,
        transportMode: 'OCEAN',
        carrierSCAC: 'MAEU',
      },
    ],
  };

  try {
    const trackingResponse = await axios.post(
      `${baseURL}/tracking/shipment-journeys`,
      trackingPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Consumer-Key': clientId,
          'Content-Type': 'application/json',
          'Api-Version': '1',
        },
      }
    );

    console.log('✅ Tracking request successful!');
    console.log(`- Journey ID: ${trackingResponse.data.shipmentJourneyIdentifier || 'N/A'}`);
    console.log(`- Container: ${trackingResponse.data.equipmentReference?.equipmentNumber || 'N/A'}`);
    console.log(`- Status: ${trackingResponse.data.equipmentReference?.equipmentStatus || 'N/A'}`);
    console.log(`- Legs found: ${trackingResponse.data.shipmentJourneyLegs?.length || 0}`);
    console.log('');
    console.log('Full response:');
    console.log(JSON.stringify(trackingResponse.data, null, 2));
  } catch (trackingError) {
    if (trackingError.response) {
      console.log('⚠️  Tracking request failed (this may be normal for test container numbers)');
      console.log(`- Status: ${trackingError.response.status}`);
      console.log(`- Error: ${JSON.stringify(trackingError.response.data, null, 2)}`);
      console.log('');
      console.log('Note: The API connection is working, but the test container number may not exist.');
      console.log('Try tracking a real container number from your shipments.');
    } else {
      throw trackingError;
    }
  }

  console.log('\n=== Test Summary ===');
  console.log('✅ Maersk API credentials are valid');
  console.log('✅ OAuth2 authentication is working');
  console.log('✅ API endpoint is accessible');
  console.log('\nYou can now use the tracking features in the application.');
  
} catch (error) {
  console.error('\n❌ Authentication failed!');
  
  if (error.response) {
    console.error(`- Status: ${error.response.status}`);
    console.error(`- Error: ${error.response.data.error || 'Unknown error'}`);
    console.error(`- Description: ${error.response.data.error_description || 'No description'}`);
    
    if (error.response.data.error === 'invalid_client') {
      console.error('\n⚠️  The credentials are invalid. Please check:');
      console.error('1. MAERSK_CLIENT_ID is correct');
      console.error('2. MAERSK_CLIENT_SECRET is correct');
      console.error('3. Credentials match the environment (sandbox vs production)');
    }
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    console.error('- Network error: Unable to connect to Maersk API');
    console.error('- Please check your internet connection');
  } else {
    console.error(`- Error: ${error.message}`);
  }
  
  console.error('\n=== Test Summary ===');
  console.error('❌ Maersk API connection test failed');
  console.error('Please verify your credentials and try again.');
  
  process.exit(1);
}
