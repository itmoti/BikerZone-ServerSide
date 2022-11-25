const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
console.log(process.env.MONGODB_USER)

const port = 5000 || process.env.PORT

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.rat3bcl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function run() {

  try {
    const usersDataBase = client.db('BikerZone').collection('users')
    const productsDataBase = client.db('BikerZone').collection('products')
    const CatagoriesDataBase = client.db('BikerZone').collection('catagories')
    const bookingDataBase = client.db('BikerZone').collection('bookings')


    // catagory route started 
    app.get('/catagories', async (req, res) => {
      const query = {}
      const result = await CatagoriesDataBase.find(query).toArray()
      res.send(result)

    })
    // catagory routed end
    //  Users route started
    app.post('/users', async (req, res) => {
      const userInfo = req.body;

      const result = await usersDataBase.insertOne(userInfo)
      res.send(result)
    })

    // admin start 

    app.get('/dashboard/allBuyers' , async(req , res) => {
      const query = {seller : false}
      const result = await  usersDataBase.find(query).toArray()
      res.send(result)
    })
    app.get('/dashboard/allSellers' , async(req , res) => {
      const query = {seller : true}
      const result = await  usersDataBase.find(query).toArray()
      res.send(result)
    })
    app.delete('/dashboard/allSellers/:id' , async(req , res) => {
      const id = req.params.id;
      console.log(id)
      const query = {_id :ObjectId(id)}
      const result = await usersDataBase.deleteOne(query)
      res.send(result)
    })
    app.delete('/dashboard/allBuyers/:id' , async(req , res) => {
      const id = req.params.id;
      console.log(id)
      const query = {_id :ObjectId(id)}
      const result = await usersDataBase.deleteOne(query)
      res.send(result)
    })

    
    // admin end 


    // Users route end

    // Products section start

    app.get('/catagory/:products', async (req, res) => {
      const products = req.params.products;
      const query = { CatagoryName: products }
      const result = await productsDataBase.find(query).toArray()
      res.send(result)
    })

    // seller start

    app.post('/dashboard/Products', async (req, res) => {
      const productInfo = req.body;
      const result = await productsDataBase.insertOne(productInfo)

      res.send(result)
    })
    app.get('/dashboard/products/:id', async (req, res) => {
      const email = req.params.id;
       const query = {
        SellerEmail : email
       }
       const result = await productsDataBase.find(query).toArray()
       res.send(result)
    })

    // seller end 


    // Products section end

    //Boking section start
    app.post('/bookings', async (req, res) => {
      const bookingInfo = req.body;
      const result = await bookingDataBase.insertOne(bookingInfo)
      res.send(result)
    })
    //Booking section end 
  }
  catch {

  }

}


run()



app.get('/', (req, res) => {
  res.send('Server Side is running')
})

app.listen(port, () => {
  console.log('service is running')
})