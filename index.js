const express = require('express');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const stripe = require("stripe")(process.env.PAYMENT_SECRET);
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
        const ordersCollection = client.db("BD_Computers_LTD").collection("orders");
        const paymentsCollection = client.db("BD_Computers_LTD").collection("payments");
        //verify jwt 
        const verifyJwt = async (req, res, next) => {

        }
        //get products
        app.get('/hardwares', async (req, res) => {
            const result = await hardwareCollection.find().toArray()
            res.send(result)
        })
        //add product
        app.post('/hardwares', async (req, res) => {
            const data = req.body;
            const result = await hardwareCollection.insertOne(data)
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
        //get reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result)
        })
        //get user profile
        app.get('/profile', async (req, res) => {
            const email = req.query.email;
            const query = { email }
            const result = await userCollection.findOne(query)
            res.send(result)
        })
        //update user profile
        app.put('/profile', async (req, res) => {
            const email = req.query.email;
            const userData = req.body;
            const filter = { email }
            const updateDoc = {
                $set: userData
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        //get all users
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        //check admin 
        app.get('/admin', async (req, res) => {
            const email = req.query.email;
            const user = await userCollection.findOne({ email });
            if (user.role === 'admin') {
                return res.send({ isAdmin: true })
            }
            res.send({ isAdmin: false })
        })
        // add order 
        app.post('/orders', async (req, res) => {
            const orderDetails = req.body;
            const result = await ordersCollection.insertOne(orderDetails)
            res.send(result)
        })
        //get order by email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })
        //delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })
        //get single product for payment
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.findOne(query)
            res.send(result)
        })
        //update order after payment
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const paymentDetails = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    orderStatus: 'paid',
                    transectionId: paymentDetails.transectionId
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc)
            const payment = paymentsCollection.insertOne(paymentDetails)
            res.send(updateDoc)
        })
        //payment api
        app.post("/create-payment-intent", async (req, res) => {
            const { totalPrice } = req.body;
            const amount = totalPrice * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });
        //get all order for admin
        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find().toArray()
            res.send(result)
        })
        //update order to shiped
        app.put('/placedOrder/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    orderStatus: 'shipped'
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc)
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