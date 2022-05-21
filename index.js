const express = require('express');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware 
app.use(express.json())
app.use(cors())





app.get('/', (req, res) => {
    res.send('Website is run')
})
app.listen(port, () => {
    console.log('listening port is', port)
})