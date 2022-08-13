const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000
const DB_HOST = process.env.DB_HOST 
const DB_USER = process.env.DB_USER || 'root'
const DB_PSK = process.env.DB_PSK

async function connect() {
    try {
        let CREDENTIALS = ""
        if (DB_USER && DB_PSK) CREDENTIALS = `${DB_USER}:${DB_PSK}@`
        const mongouri = `mongodb+srv://${CREDENTIALS}${DB_HOST}`
        await mongoose.connect(mongouri)
        return mongouri
    } catch (err) {
        throw new Error(`Could not connect to db 'mongodb://${DB_HOST}': ${err}`)
    }
}

module.exports = {
    connect,
    PORT,
    DB_HOST,
    DB_NAME
}