const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors({ corsOptions }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.omy4kgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const volunteerCollection = client
      .db("volunteerVerse")
      .collection("volunteer");
    const requestCollection = client
      .db("volunteerVerse")
      .collection("requests");

    app.get("/volunteers", async (req, res) => {
      const result = await volunteerCollection
        .find()
        .sort({ deadline: 1 })
        .toArray();
      res.send(result);
    });
    app.post("/volunteers", async (req, res) => {
      const newVolunter = req.body;

      const result = await volunteerCollection.insertOne(newVolunter);
      res.send(result);
    });
    app.get("/volunteer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    app.delete("/volunteer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/volunteer/:id', async (req, res) =>{
      const { id } = req.params;
      const filter ={ _id: new ObjectId(id) };
      const updateDoc = { $set: req.body };
      const result = await volunteerCollection.updateOne(filter, updateDoc);
      res.send(result)


    })

    app.get("/managemypost/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await volunteerCollection
        .find({ 
          organizer_email: req.params.email })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("volunteer verse is running");
});

app.listen(port, () => {
  console.log(`Volunteer verse is running on port ${port}`);
});
