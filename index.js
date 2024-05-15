const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://volunteer-verse.web.app",
    "https://volunteer-verse.firebaseapp.com",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//verify jwt middleware

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "unauthorized access" });
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({ message: "unauthorized access" });
      }
      console.log(decoded);

      req.user = decoded;
      next();
    });
  }
};

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

    //jwt token

    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    //clear cookie
    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });

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

    app.put("/volunteer/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: req.body };
      const result = await volunteerCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/allvolunteer/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { volunteers_needed: -1 },
      };
      const result = await volunteerCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/managemypost/:email", verifyToken, async (req, res) => {
      console.log(req.params.email);
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await volunteerCollection
        .find({
          organizer_email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    //be volunteer

    app.get("/bevolunteers", async (req, res) => {
      const result = await requestCollection.find().toArray();
      res.send(result);
    });

    app.get("/bevolunteer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.findOne(query);
      res.send(result);
    });

    app.delete("/bevolunteer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/bevolunteer", async (req, res) => {
      const newBeVolunter = req.body;

      const token = req.cookies.token;
      console.log(token);
      const result = await requestCollection.insertOne(newBeVolunter);
      res.send(result);
    });

    app.get("/mybevolunteerreq/:email", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await requestCollection
        .find({
          volunteer_email: req.params.email,
        })
        .toArray();
      res.send(result);
    });
    //get all requests from db for job organizer
    app.get("/bevolunteerreq/:email", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await requestCollection
        .find({
          organizer_email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
