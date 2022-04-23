const axios = require('axios');

const APIClient = axios.create({
    baseURL: 'https://livepeer.com/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.LIVEPEER_API_KEY}`
    },
});

module.exports = APIClient;
