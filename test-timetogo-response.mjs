import 'dotenv/config';

const API_KEY = '6553d312-72b9-4058-a56f-b7cff2686de8';
const CONTAINER_NUMBER = 'MSDU8368827'; // Example container number
const COMPANY = 'AUTO';

async function testTimeToGoAPI() {
  try {
    const url = `https://tracking.timetocargo.com/v1/container?api_key=${API_KEY}&company=${COMPANY}&container_number=${CONTAINER_NUMBER}`;
    
    console.log('Testing TimeToGo API...');
    console.log('URL:', url.replace(API_KEY, '***'));
    
    const response = await fetch(url);
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    console.log('\n=== FULL API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data) {
      console.log('\n=== DATA STRUCTURE ===');
      console.log('Summary:', data.data.summary);
      console.log('Container:', data.data.container);
      console.log('Events:', data.data.events?.length || 0, 'events');
      console.log('Route:', data.data.route);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTimeToGoAPI();
