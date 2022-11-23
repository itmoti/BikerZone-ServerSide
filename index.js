const express = require('express')
const app = express()
require('dotenv').config()

const port = 5000 || process.env.PORT


app.get('/' , (req , res) => {
  res.send('Server Side is running') 
})

app.listen(port  , () => {
  console.log('service is running')
})