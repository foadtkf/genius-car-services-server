const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;


// node
// require('crypto').randomBytes(64).toString('hex')
//middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req,res,next){
      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized'})
      }
      const token = req.headers.authorization.split(' ')[1]
      // jwt.verify(token , process.env.ACCESS_TOKEN,(err,decoded)=>{
      //   if(err){
      //     return res.status(403).send({message: 'Forbidden access'})
      //   }
      //   console.log('decoded',decoded)
      // })
      console.log(token,process.env.ACCESS_TOKEN,'inside verifyJWT!',req.headers.authorization)
      
      next()
}


const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sq6of.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("genius-car").collection("service");
    const orderCollection = client.db("genius-car").collection("order");

    // Auth
    app.post("/login", async(req, res) => {
      const user = req.body;
      const accesstoken = jwt.sign(user,process.env.ACCESS_TOKEN,{
        expiresIn: '1d'
      })
      res.send({accesstoken})
    });

    // Services API
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/order",verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log("listening to port ", port);
});
