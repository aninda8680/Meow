
const mongoose = require('mongoose');

async function testMongoose() {
    const uri = "mongodb+srv://meow_db:aninda8680@cluster0.dlj0ohx.mongodb.net/?appName=Cluster0";
    
    try {
        console.log("Attempting to connect with Mongoose...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("Successfully connected with Mongoose!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Mongoose connection failed!");
        console.error(err);
    }
}

testMongoose();
