require('dotenv').config();

const config = {
    PORT: process.env.PORT,
    ATLAS_URI: process.env.ATLAS_URI,
    MONGO_URI: process.env.MONGO_URI
}

module.exports = config;