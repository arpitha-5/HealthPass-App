const mongoose = require('mongoose');

async function fixDb() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/healthpass');
        console.log('Connected');
        await mongoose.connection.collection('users').dropIndex('referralCode_1').catch(e => console.log('not found'));
        console.log('Indexes dropped');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDb();
