const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ RATE LIMITER (ADDED SECURITY)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // max 5 requests per minute
  message: "Too many requests, please try again later."
});

// Apply limiter ONLY on login route
app.use("/api/auth/signin", limiter);

// Database
const db = require("./app/models");
const Role = db.role;


require('mongoose').set('strictQuery', true);

db.mongoose
  .connect("mongodb://krishnayadav45000_db_user:Littlefinger@ac-ocialae-shard-00-00.zoljjro.mongodb.net:27017,ac-ocialae-shard-00-01.zoljjro.mongodb.net:27017,ac-ocialae-shard-00-02.zoljjro.mongodb.net:27017/test?ssl=true&replicaSet=atlas-j57mii-shard-0&authSource=admin&retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// Routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to secure auth system." });
});

// Set port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Roles setup
function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({ name: "user" }).save();
      new Role({ name: "moderator" }).save();
      new Role({ name: "admin" }).save();
    }
  });
}