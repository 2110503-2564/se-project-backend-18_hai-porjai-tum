const axios = require('axios');
require('dotenv').config();

exports.isHighSeason = async function isHighSeason(date) {
    const apiKey = '0TouIBeU7cnyYWS1Zepo8g==vcaZOKYT9821wKyc';
    const aDate = new Date(date);
    const year = aDate.getFullYear();
    const month = aDate.getMonth() + 1;
    const day = aDate.getDate();
    
    try {
        const response = await axios.get(`https://api.api-ninjas.com/v1/holidays`, {
            params: {
                country: 'US', 
                year: year
            },
            headers: { 'X-Api-Key': apiKey }
        });

        const holidays = response.data;
        
        // Check if today's date matches any holiday
        return holidays.some(holiday => {
            const holidayDate = new Date(holiday.date);
            return holidayDate.getFullYear() === year &&
                   holidayDate.getMonth() + 1 === month &&
                   holidayDate.getDate() === day;
        });
    } catch (error) {
        console.error('Error fetching high season data:', error);
        return false; // Assume it's not high season if API fails
    }
}
// module.exports = isHighSeason;
