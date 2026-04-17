const mongoose = require('mongoose');
const Activity = require('./models/Activity');

const MONGODB_URI = "mongodb+srv://meow_db:aninda8680@cluster0.dlj0ohx.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB (Tracker)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Log a window session
async function logSession(app, title, duration) {
    try {
        /*
        await Activity.create({
            app,
            title,
            duration,
            type: 'app',
            timestamp: new Date()
        });
        */
        console.log(`✨ Logged App: ${app}`);
    } catch (err) {
        console.error('❌ Failed to log session:', err);
    }
}

// Log a tab session (receives from frontend)
async function logTab(domain, title, duration, id) {
    try {
        /*
        await Activity.create({
            domain,
            title,
            duration,
            type: 'tab',
            timestamp: new Date()
        });
        */
        console.log(`🔹 Logged Tab: ${domain}`);
    } catch (err) {
        console.error('❌ Failed to log tab:', err);
    }
}

async function getStats() {
    try {
        const sessions = await Activity.find().sort({ timestamp: -1 }).limit(50);
        // Transform sessions back into the expected format for the frontend if needed
        // Or update the frontend to handle the MongoDB structure.
        // For now, let's return a basic structure.
        return {
            sessions,
            totals: {} // We can compute totals on the fly or via aggregation
        };
    } catch (err) {
        return { sessions: [], totals: {} };
    }
}

async function clearDB() {
    try {
        await Activity.deleteMany({});
        console.log("🧹 Database cleared.");
    } catch (err) {
        console.error('❌ Failed to clear DB:', err);
    }
}

module.exports = { logSession, logTab, getStats, clearDB };
