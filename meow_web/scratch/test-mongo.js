
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = "mongodb+srv://meow_db:aninda8680@cluster0.dlj0ohx.mongodb.net/?appName=Cluster0";
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000
    });

    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Successfully connected to MongoDB!");
        await client.close();
    } catch (err) {
        console.error("Connection failed!");
        console.error(err);
    }
}

testConnection();
