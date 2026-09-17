// Owner: Arsath
// utils/ConfigReader.js
require('dotenv').config();

class ConfigReader {
    static get(key, defaultValue = '') {
        return process.env[key] || defaultValue;
    }
}

module.exports = { ConfigReader };