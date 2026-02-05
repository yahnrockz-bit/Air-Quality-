export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ECOWITT_API_KEY;
    
    if (!API_KEY) {
      return res.status(400).json({ error: 'Missing API key' });
    }
    
    const response = await fetch('https://api.ecowitt.net/api/v1/device/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return res.status(500).json({ error: 'No devices found' });
    }
    
    const device = data.data[0];
    const realtimeResponse = await fetch(`https://api.ecowitt.net/api/v1/device/real_time?mac=${device.mac}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    const realtimeData = await realtimeResponse.json();
    
    res.status(200).json({
      pm25: realtimeData.data.pm25 || 0,
      pm10: realtimeData.data.pm10 || 0,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
