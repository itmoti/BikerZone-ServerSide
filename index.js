const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

var jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


const port = 5000 || process.env.PORT

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.rat3bcl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function run() {
  function VerifyJwt(req , res , next) {
   
    const authHeader = req.headers.authorization
   
   
    if(!authHeader) {
      return res.send({message : 'Access Token Unavailable'})
    }
    const accessToken = authHeader.split(' ')[1]

    jwt.verify(accessToken , process.env.JWT_SECRET_KEY , function (err , decoded) {
      if(err) {
        return res.send({message : 'invalid token'})
      }

    if(decoded.email) {
      const decodedMail = decoded.email

      req.decodedMail = decodedMail
    }
    })
 
    next()
  }

  try {
    const usersDataBase = client.db('BikerZone').collection('users')
    const productsDataBase = client.db('BikerZone').collection('products')
    const CatagoriesDataBase = client.db('BikerZone').collection('catagories')
    const bookingDataBase = client.db('BikerZone').collection('bookings')
    const paymentsCollection = client.db('BikerZone').collection('payments')



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
      
      const filter = {email : userInfo.email}
      const available = await usersDataBase.findOne(filter)
      
      let result;
      if(!available) {
         result = await usersDataBase.insertOne(userInfo)
      }
     else{
      result = {message : 'already in database'}
     }
      res.send(result)
    })
     app.get('/validUser/:id' , async(req , res) => {
    
      const email = req.params.id;
     const filter = {email :email }
     const result = await usersDataBase.findOne(filter)

     res.send({result : result})
     })
  
     app.get('/verifySeller/:id'  , async(req , res) => {
      const email = req.params.id
      const filter = {email : email}
      const result = await usersDataBase.findOne(filter)
      if(result?.Verified) {
        return   res.send({verify : true})
      }
      else{
        res.send({verify:false})
      }
     })
    // admin start 

    app.get('/dashboard/allBuyers' ,VerifyJwt, async(req , res) => {
      const query = {role : 'buyer'}
      const email = req.decodedMail
      const filter = {email : email}
      const user = await usersDataBase.findOne(filter)
       if(user?.role === 'admin') {
        const result = await  usersDataBase.find(query).toArray()
        return res.send(result)
      }
      res.send({message : 'not a admin'})
    
      
     
    })
    app.get('/dashboard/allSellers' ,VerifyJwt , async(req , res) => {
      
      const query = {role : 'seller'}
    

      const email = req.decodedMail
      const filter = {email : email}
      const user = await usersDataBase.findOne(filter)
       if(user?.role === 'admin') {
        const result = await  usersDataBase.find(query).toArray()
        return res.send(result)
      }
      res.send({message : 'not a admin'})
    })
    app.delete('/dashboard/allSellers/:id' ,VerifyJwt, async(req , res) => {

      const id = req.params.id;
      const query = {_id :ObjectId(id)}

      const email = req.decodedMail
      const filter = {email : email}
      const user = await usersDataBase.findOne(filter)
       if(user?.role === 'admin') {
        const result = await usersDataBase.deleteOne(query)
      return  res.send(result)
      }
      res.send({message : 'not a admin'})
    
      
    })
    app.delete('/dashboard/allBuyers/:id' , VerifyJwt,async(req , res) => {
      const id = req.params.id;

      const query = {_id :ObjectId(id)}
  

      const email = req.decodedMail
      const filter = {email : email}
      const user = await usersDataBase.findOne(filter)
       if(user?.role === 'admin') {
        const result = await usersDataBase.deleteOne(query)
       return res.send(result)
      }
      res.send({message : 'not a admin'})
    })
    app.delete('/dashboard/reportedproducts/:id' , VerifyJwt, async (req, res) => {
      const id = req.params.id;
   
       const query = {_id : ObjectId(id)}
      

       const email = req.decodedMail
       const filter = {email : email}
       const user = await usersDataBase.findOne(filter)
        if(user?.role === 'admin') {
          const result = await productsDataBase.deleteOne(query)
         return res.send(result)
       }
       res.send({message : 'not a admin'})
    })
    app.put('/dashboard/allSellers/verify/:id' ,VerifyJwt, async(req , res) => {
      const id = req.params.id;
      const filter = {_id : ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Verified: true
        },
      };
      const result = await usersDataBase.updateOne(filter , updateDoc , options)

      res.send(result)
    })

    
    // admin end 


    // Users route end

    // Products route start

    app.get('/catagory/:products', async (req, res) => {
      const products = req.params.products;
      const query = { CatagoryName: products }
      const result = await productsDataBase.find(query).toArray()
      // const filter = {} 
      // const users = await usersDataBase.find(filter).toArray()

    // const user =  result.forEach( product => {
    //   const selleremail =  product.SellerEmail;
    //   // console.log(selleremail)
    //   const query2 = {email:selleremail}
    //   // console.log(users)
    //   // const hack =  await usersDataBase.findOne(query2)
    //   // console.log(hack)
      
    //   const email = users.filter(user => user?.email === selleremail )
    //   const i = 0;
    //   console.log( i+1, email)
    //   // console.log(email)
    //   // console.log(users)
   
    //   // const email = users.filter
    //   // console.log(email)
    // })
     
      res.send(result)
    })

    // seller start

    app.post('/dashboard/Products',VerifyJwt, async (req, res) => {
    
      const productInfo = req.body;
      const email = req.decodedMail;
      const query = {email : email}
      const  user =await  usersDataBase.findOne(query)
  
      if(user.role === 'seller'){
        const result = await productsDataBase.insertOne(productInfo)
        return res.send(result)
      }
      else {
       res.send({message : 'User not a seller'})
      }
      
     
    })
    app.put('/dashboard/Products/:id', VerifyJwt,async (req, res) => {
      const id = req.params.id;
    
      const filter = {_id : ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Adveritse: true
        },
      };
      const result = await productsDataBase.updateOne(filter , updateDoc , options)

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
    app.delete('/dashboard/products/:id', VerifyJwt ,async (req, res) => {
      const id = req.params.id;
   
       const query = {_id : ObjectId(id)}
       const result = await productsDataBase.deleteOne(query)
       res.send(result)
    })

    

    // seller end 

    // user start 

  app.put('/catagory/product/:id' ,VerifyJwt, async (req , res) => {
    const id =req.params.id
    const filter = {_id: ObjectId(id)}
    const options = { upsert: true };
      const updateDoc = {
        $set: {
          Reported: true
        },
      };
      const result = await productsDataBase.updateOne(filter , updateDoc , options)
      res.send(result)
  })
  
  app.get('/dashboard/reportedItems' ,VerifyJwt ,  async(req , res) => {
    const filter = {Reported : true}
    const result = await productsDataBase.find(filter).toArray()
    res.send(result)
  })

  app.get('/advetisedItems' ,VerifyJwt, async (req ,res) => {
    const query = {Adveritse : true}
    const result = await productsDataBase.find(query).toArray()
    res.send(result)
  })
    // user end 

    // Products router end

    //Boking section start
    app.post('/bookings',VerifyJwt,  async (req, res) => {
      const bookingInfo = req.body;
      console.log(bookingInfo)
      const result = await bookingDataBase.insertOne(bookingInfo)
      res.send(result)
    })
    app.get('/bookings' , VerifyJwt, async (req , res) => {
      const email = req.query.email
   
    console.log(email)
      const filter = {BuyerEmail : email}
    
      const result = await bookingDataBase.find(filter).toArray()
      res.send(result)
    })
    app.get('/bookings/:id' , async ( req ,res ) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const bookings = await bookingDataBase.findOne(query)
     
      res.send(bookings) 
  })
    //Booking section end 

  // admin and seller role checking start 
  app.get('/users/seller/:email' , async (req , res) => {
    const email = req.params.email;
    const query = {email : email}
   
    const user = await usersDataBase.findOne(query)

    res.send({isSeller : user?.role === 'seller'})
  }) 
  app.get('/users/admin/:email' , async (req , res) => {
    const email = req.params.email;
    const query = {email : email}
   
    const user = await usersDataBase.findOne(query)

    res.send({IsAdmin : user?.role === 'admin'})
  }) 



  // admin and seller role checking end 


    // jst token creating  route

    app.get('/jwt' , async(req , res) => {
 
      const email = req.query.email

      const filter = {email : email}

      const available = await usersDataBase.findOne(filter)
  
     
      if(!available) {
        res.send({message : 'not in database'})
         return 
         
      }
     else{
      var token = jwt.sign({email}, process.env.JWT_SECRET_KEY);
      res.send({accessToken : token})
     }
    })
 

    app.post('/payments'  ,VerifyJwt, async(req , res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment)

      const id = payment.bookingId
      const filter = {_id : ObjectId(id)}
      const updateDoc = {
          $set : {
              paid : true , 
              transactionId : payment.transactionId
          }
      }

      const updateBookingsDb = await bookingDataBase.updateOne(filter,updateDoc) 
      res.send(result)
  })
    app.post('/create-payment-intent' , VerifyJwt ,async(req , res) => {
     
      const booking = req.body;
   
      const price = booking.ResellPrice;
  
      const amount =price*100

      const paymentIntent = await stripe.paymentIntents.create({
          currency : 'usd' , 
          amount : amount , 
          "payment_method_types" : [
              "card"
          ] 
          
      })
      res.send({
          clientSecret : paymentIntent.client_secret 
      })
  })
 
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