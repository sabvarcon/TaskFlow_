const getWeather = async (req, res, next) => {
    try {
        const city = String(req.query.city || '').trim();
        if (!city || city.length > 80) return res.status(400).json({ mensaje: 'Indica una ciudad válida (máximo 80 caracteres).' });
        if (!process.env.OPENWEATHER_API_KEY) return res.status(503).json({ mensaje: 'El servicio del clima no está configurado. Agrega OPENWEATHER_API_KEY en las variables de entorno.' });
        const url = new URL('https://api.openweathermap.org/data/2.5/weather');
        url.search = new URLSearchParams({ q: city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', lang: 'es' }).toString();
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const data = await response.json();
        if (!response.ok) return res.status(response.status === 404 ? 404 : 502).json({ mensaje: response.status === 404 ? 'No se encontró esa ciudad.' : 'El proveedor del clima no está disponible.' });
        res.json({ ciudad: data.name, pais: data.sys?.country, temperatura: data.main?.temp, sensacion: data.main?.feels_like, humedad: data.main?.humidity, descripcion: data.weather?.[0]?.description, icono: data.weather?.[0]?.icon });
    } catch (error) { next(error); }
};
module.exports = { getWeather };
