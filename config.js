require('dotenv').config();

const config = {
    PORT: process.env.PORT,
    ATLAS_URI: process.env.ATLAS_URI
}

module.exports = config;