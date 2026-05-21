const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = "mongodb://localhost:27017/healthpass";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to Local MongoDB");
    const adminDb = client.db('admin');
    const result = await adminDb.command({ replSetGetStatus: 1 });
    console.log("Is Replica Set:", result.ok === 1);
  } catch (err) {
    if (err.codeName === 'CommandNotFound' || err.codeName === 'NotYetInitialized') {
      console.log("Not a replica set");
    } else {
      console.error("Connection failed", err);
    }
  } finally {
    await client.close();
  }
}

testConnection();
