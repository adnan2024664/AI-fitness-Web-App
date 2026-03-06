# MyFitnessAI – How to Run the Web Application

# Requirements:
- Node.js installed
- MongoDB Atlas account (cloud database)
- Visual Studio Code with Live Server extension

# Steps to Run:

1. Download or unzip the full project folder.

2. Open the folder in Visual Studio Code.

3. Install all backend dependencies by running:
    npm install

4. Create a file called .env in the root of your project if there isnt already.

5. Paste this into your .env file:
   MONGO_URI=mongodb+srv://adnaniq25:H-roon123@cluster0.sqkjj.mongodb.net/fitnesAI?retryWrites=true&w=majority&appName=Cluster0
   PORT=5000

   note: only do step 5 if there isnt a .env 

6. Start your backend server by running:
   node server.js

   You should see:
   ✅ Connected to MongoDB Atlas
   🚀 Server running on http://localhost:5000

7. Right-click index.html and select “Open with Live Server”.

8. You can now sign up, log in, and run the AI Fitness web application.


