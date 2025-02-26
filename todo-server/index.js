const express = require("express");
require("dotenv").config({ path: "./vars/.env" });
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clustervisa.kw9rj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterVisa`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const todosCollection = client.db("todosDB").collection("todos");
    const usersCollection = client.db("todosDB").collection("users");

    
    app.get("/todos/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = {email: email}
        const result = await todosCollection.find(query).toArray();
        console.log(result)
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
      }
    });


    app.get("/todo/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }; 
        const result = await todosCollection.findOne(query); 
        res.send(result); 
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch task" });
      }
    });

    app.post("/todos", async (req, res) => {
      try {
        const { title, description, category, email } = req.body;
        if (!title || !description || !category || !email) {
          return res.status(400).json({ error: "All fields are required" });
        }
        const newTask = {
          title,
          description,
          category,
          email,
          createdAt: new Date(),
        };
        const result = await todosCollection.insertOne(newTask);
        res.status(201).json({ ...newTask, _id: result.insertedId });
      } catch (err) {
        res.status(500).json({ error: "Failed to add task" });
      }
    });


    app.put("/todos/:id", async (req, res) => {
      try {
        const { category } = req.body;
        const id = req.params.id;
        if (!category) {
          return res.status(400).json({ error: "Category is required" });
        }
        const result = await todosCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
        res
          .status(200)
          .json({ success: true, message: "Task updated successfully" });
      } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
      }
    });

    app.put("/todo-update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
          return res.status(400).json({ error: "All fields are required" });
        }
        const result = await todosCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, description, category } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }

        res
          .status(200)
          .json({ success: true, message: "Task updated successfully" });
      } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
      }
    });


    app.delete("/todos/:taskId", async (req, res) => {
      try {
        const { taskId } = req.params;
        const query = { _id: new ObjectId(taskId) };
        const result = await todosCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res
            .status(200)
            .json({ success: true, message: "Task deleted successfully" });
        } else {
          res.status(404).json({ success: false, message: "Task not found" });
        }
      } catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
      }
    });

    // Add a user
    app.post("/user", async (req, res) => {
      try {
        const userInfo = req.body;
        const result = await usersCollection.insertOne(userInfo);
        res.send(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to add user" });
      }
    });

    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to database", err);
  }
}

run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Todo Server");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
