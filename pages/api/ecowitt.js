export default async function handler(req, res) {
  try {
    const APP_KEY = process.env.ECOWITT_APP_KEY;
    const API_KEY = process.env.ECOWITT_API_KEY;
    
    if (!APP_KEY || !API_KEY) {
      return res.status(400).json({ error: 'Missing Ecowitt credentials' });
    }
    
    // Using Ecowitt's API v1 endpoint for application key
    const response = await fetch('https://api.ecowitt.net/api/v1/device/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Ecowitt API error:', response.status);
      return res.status(500).json({ error: `Ecowitt API error: ${response.status}` });
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return res.status(500).json({ error: 'No devices found in Ecowitt account' });
    }
    
    // Get the first device's real-time data
    const device = data.data[0];
    const deviceMac = device.mac;
    
    // Fetch real-time data for this device
    const realtimeResponse = await fetch(`https://api.ecowitt.net/api/v1/device/real_time?mac=${deviceMac}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!realtimeResponse.ok) {
      console.error('Real-time API error:', realtimeResponse.status);
      return res.status(500).json({ error: 'Failed to fetch real-time data' });
    }
    
    const realtimeData = await realtimeResponse.json();
    
    if (!realtimeData.data) {
      return res.status(500).json({ error: 'No real-time data available' });
    }
    
    // Extract PM2.5 and PM10 - Ecowitt uses these field names
    const pm25 = realtimeData.data.pm25 !== undefined ? parseFloat(realtimeData.data.pm25) : 0;
    const pm10 = realtimeData.data.pm10 !== undefined ? parseFloat(realtimeData.data.pm10) : 0;
    
    res.status(200).json({
      pm25: pm25,
      pm10: pm10,
      timestamp: new Date().toISOString(),
      deviceName: device.name || 'Unknown'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
