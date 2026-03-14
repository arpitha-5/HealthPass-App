const mongoose = require('mongoose');

async function fixDb() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/healthpass');
        console.log('Connected');
        await mongoose.connection.collection('users').dropIndex('mobile_1').catch(e => console.log('Index mobile_1 not found', e.message));
        await mongoose.connection.collection('users').dropIndex('mobileNumber_1').catch(e => console.log('Index mobileNumber_1 not found', e.message));
        console.log('Indexes dropped');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDb();
