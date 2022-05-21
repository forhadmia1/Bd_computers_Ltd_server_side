const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware 
app.use(express.json())
app.use(cors())

//dongodb connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oyudp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const partsCollection = client.db("BD_Computers_LTD").collection("parts");
        console.log('database connected')

    } finally {

    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Website is run')
})
app.listen(port, () => {
    console.log('listening port is', port)
})