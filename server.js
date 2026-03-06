require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.static(__dirname));

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// connection to MongoDB databse 
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    fitnessGoal: String
});

const User = mongoose.model('User', UserSchema);

// SIGNUP
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "❌ User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ 
            message: "✅ User created successfully!", 
            redirect: "user-details.html"
        });

    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "❌ Error signing up", error });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "❌ Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ success: false, message: "❌ Invalid login." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "❌ Invalid password." });
        }

        res.json({ success: true, message: "✅ Login successful!", redirect: "dashboard.html" });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "❌ Server error. Please try again." });
    }
});

// USER DETAILS
app.post('/details', async (req, res) => {
    const { email, age, gender, weight, height } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "❌ User not found." });

        user.age = age;
        user.gender = gender;
        user.weight = weight;
        user.height = height;

        await user.save();
        res.status(201).json({ message: "✅ Personal details saved!", redirect: "fitness-goals.html" });

    } catch (error) {
        console.error("❌ Details Error:", error);
        res.status(500).json({ message: "❌ Server error." });
    }
});

//FITNESS GOALS
app.post('/fitness-goals', async (req, res) => {
    const { email, goal } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "❌ User not found." });

        user.fitnessGoal = goal;
        await user.save();

        res.status(200).json({ message: "✅ Fitness goal saved!", redirect: "processing.html" });

    } catch (error) {
        console.error("❌ Fitness Goal Error:", error);
        res.status(500).json({ message: "❌ Error saving goal" });
    }
});

//GET USER DATA FOR AI
app.get('/api/user-data', async (req, res) => {
    const email = req.query.email;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "❌ User not found." });

        res.json({
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender,
            weight: user.weight,
            height: user.height,
            fitnessGoal: user.fitnessGoal
        });

    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ error: "❌ Server error." });
    }
});


app.get("/", (req, res) => {
    res.send("✅ Server is running!");
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
