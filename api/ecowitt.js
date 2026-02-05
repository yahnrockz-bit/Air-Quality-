export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ECOWITT_API_KEY;
    const STATION_MAC = process.env.ECOWITT_STATION_MAC;
    
    if (!API_KEY || !STATION_MAC) {
      return res.status(400).json({ error: 'Missing API credentials' });
    }
    
    const response = await fetch('https://api.ecowitt.net/api/v3/device/real_time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: API_KEY,
        mac: STATION_MAC,
      }),
    });
    
    const data = await response.json();
    
    if (!data.data) {
      return res.status(500).json({ error: 'Invalid Ecowitt response' });
    }
    
    const pm25 = data.data.pm25 || 0;
    const pm10 = data.data.pm10 || 0;
    
    res.status(200).json({
      pm25: pm25,
      pm10: pm10,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
