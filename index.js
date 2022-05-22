const express = require('express');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
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
        const hardwareCollection = client.db("BD_Computers_LTD").collection("hardwares");
        const userCollection = client.db("BD_Computers_LTD").collection("users");
        const reviewsCollection = client.db("BD_Computers_LTD").collection("reviews");
        //verify jwt 
        const verifyJwt = async (req, res, next) => {

        }
        //get products
        app.get('/hardwares', async (req, res) => {
            const result = await hardwareCollection.find().toArray()
            res.send(result)
        })
        //get single item
        app.get('/hardware/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await hardwareCollection.findOne(query)
            res.send(result)
        })
        //add user and token issue
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ result, token })
        })
        //add reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)

        })





    } finally {

    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('BD_Computers_LTD Website is run')
})
app.listen(port, () => {
    console.log('listening port is', port)
})