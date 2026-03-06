document.addEventListener("DOMContentLoaded", function () {

    // SIGN-UP FORM HANDLER
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const message = document.getElementById("message");

            try {
                const response = await fetch("http://localhost:5000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.status === 201) {
                    localStorage.setItem("userEmail", email); 
                    message.style.color = "green";
                    message.textContent = data.message;
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1500);
                } else {
                    message.style.color = "red";
                    message.textContent = data.message;
                }
            } catch (error) {
                message.textContent = "❌ Error signing up.";
            }
        });
    }

// USER DETAILS FORM HANDLER 
const detailsForm = document.getElementById("userDetailsForm");
if (detailsForm) {
    detailsForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = localStorage.getItem("userEmail");
        const age = document.getElementById("age").value;
        const gender = document.getElementById("gender").value;
        const weight = document.getElementById("weight").value;
        const height = document.getElementById("height").value;
        const detailsMessage = document.getElementById("detailsMessage"); 

        try {
            const response = await fetch("http://localhost:5000/details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, age, gender, weight, height })
            });

            const data = await response.json();

            if (response.status === 201) {
                detailsMessage.style.color = "green";
                detailsMessage.textContent = data.message; 

                setTimeout(() => {
                    window.location.href = data.redirect; 
                }, 1500); 
            } else {
                detailsMessage.style.color = "red";
                detailsMessage.textContent = data.message;
            }
        } catch (error) {
            detailsMessage.style.color = "red";
            detailsMessage.textContent = "❌ Error saving details.";
        }
    });
}

});

document.addEventListener("DOMContentLoaded", function () {
    let selectedGoal = null;

    // Handle Goal Selection 
    document.querySelectorAll(".goal-option").forEach(option => {
        option.addEventListener("click", function () {
            
            document.querySelectorAll(".goal-option").forEach(opt => opt.classList.remove("selected"));
            
            
            this.classList.add("selected");

            
            selectedGoal = this.getAttribute("data-goal");

            
            document.getElementById("proceedBtn").disabled = false;
        });
    });

    //Manage Goal Submission
    document.getElementById("proceedBtn").addEventListener("click", async function () {
        if (!selectedGoal) {
            alert("Please select a fitness goal!");
            return;
        }

        const email = localStorage.getItem("userEmail");

        try {
            const response = await fetch("http://localhost:5000/fitness-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, goal: selectedGoal })
            });

            const data = await response.json();

            if (response.status === 200) {
                window.location.href = data.redirect; 
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("❌ Error saving goal.");
        }
    });
});

//Login form handler 
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();
            const loginMessage = document.getElementById("loginMessage");

            if (!email || !password) {
                loginMessage.style.color = "red";
                loginMessage.textContent = "❌ Please enter your email and password.";
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    loginMessage.style.color = "green";
                    loginMessage.textContent = data.message;

                    
                    localStorage.setItem("userEmail", email);

                  
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1500);
                } else {
                    loginMessage.style.color = "red";
                    loginMessage.textContent = data.message;
                }
            } catch (error) {
                console.error("Login error:", error);
                loginMessage.style.color = "red";
                loginMessage.textContent = "❌ Server error. Please try again.";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const loadingEl = document.getElementById("loading");
    const galleryEl = document.getElementById("workout-gallery");
  
    if (!loadingEl || !galleryEl) return;
  
    const email = localStorage.getItem("userEmail");
    if (!email) {
      loadingEl.innerText = "❌ No user logged in.";
      return;
    }
  
    try {
      const model = await tf.loadLayersModel("AI/AI/tfjs_model/model.json");
  
      const response = await fetch(`http://localhost:5000/api/user-data?email=${email}`);
      const user = await response.json();
  
      if (!user || !user.age || !user.gender || !user.fitnessGoal) {
        loadingEl.innerText = "❌ Incomplete user data.";
        return;
      }
  
      const inputTensor = tf.tensor2d([[
        user.age,
        user.gender === "Male" ? 1 : 0,
        user.weight,
        user.height,
        goalToNumber(user.fitnessGoal)
      ]]);
  
      const prediction = model.predict(inputTensor);
      const predictedClass = prediction.argMax(1).dataSync()[0];
  
      const workoutImages = getWorkoutImages(predictedClass);
      galleryEl.innerHTML = workoutImages.map(img => `
        <div class="workout-card" onclick="window.location.href='video-player.html?video=${encodeURIComponent(img.video)}'">
          <img src="${img.src}" alt="${img.name}" />
          <p>${img.name}</p>
        </div>
      `).join("");
      
  
      loadingEl.style.display = "none";
      galleryEl.style.display = "flex";
  
    } catch (error) {
      console.error("Prediction error:", error);
      loadingEl.innerText = "❌ Failed to generate workout.";
    }
  
    function goalToNumber(goal) {
      const goals = {
        "Weight Loss": 0,
        "Muscle Gain": 1,
        "Endurance": 2,
        "Flexibility": 3,
        "General Fitness": 4
      };
      return goals[goal] ?? 4;
    }
  
    function getWorkoutImages(predictedClass) {
      const workouts = [
        [ //Hiit workout
          { name: "Full Body HIIT", src: "assets/hiit.jpg", video: "assets/videos/Full_Body_Hiit.mp4" },
          { name: "Intense Burn", src: "assets/hiit2.jpg", video: "assets/videos/Intense_Burn.mp4" },
          { name: "HIIT Express", src: "assets/hiit3.jpg", video: "assets/videos/Hiit_Express.mp4" }
        ],
        [ // Cardio workouts 
          { name: "Cardio & Abs", src: "assets/cardio.jpg", video: "assets/videos/Abs_&_Cardio.mp4" },
          { name: "Fat Burner", src: "assets/cardio2.jpg", video: "assets/videos/Fat_Burner.mp4" },
          { name: "Abs Focus", src: "assets/cardio3.jpg", video: "assets/videos/Abs_Focus.mp4" }
        ],
        [ // Strength workouts 
          { name: "Strength Training", src: "assets/strength.jpg", video: "assets/videos/Strength_Training.mp4" },
          { name: "Heavy Lifts", src: "assets/strength2.jpg", video: "assets/videos/Heavy_Lifts.mp4" },
          { name: "Resistance Focus", src: "assets/strength3.jpg", video: "assests/videos/Resistance_Focus.mp4" }
        ],
        [ // Yoga workouts 
          { name: "Yoga Flow", src: "assets/yoga.jpg", video: "assets/videos/Yoga.mp4" },
          { name: "Stretch & Calm", src: "assets/yoga2.jpg", video: "assets/videos/Stretch_&_Calm.mp4" },
          { name: "Flexibility Boost", src: "assets/yoga3.jpg", video: "assets/videos/Flexibility_Boost.mp4" }
        ],
        [ // General Fitness workouts 
          { name: "Daily Fitness", src: "assets/weightloss.jpg", video: "assets/videos/Daily_Fitness.mp4" },
          { name: "All-Around Burn", src: "assets/weightloss2.jpg", video: "assets/videos/All-Around_Burn.mp4" },
          { name: "Balanced Routine", src: "assets/weightloss3.jpg", video: "assets/videos/Balance_Workout.mp4" }
        ]
      ];
  
      return workouts[predictedClass] || workouts[0];
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const videoPath = params.get("video"); 
    const video = document.getElementById("workoutVideo");
    const title = document.getElementById("video-title");
    const playPauseBtn = document.getElementById("playPauseBtn");
  
    if (video && videoPath) {
      video.src = videoPath;
      const workoutName = decodeURIComponent(videoPath.split("/").pop().replace(".mp4", "").replaceAll("_", " "));
      title.textContent = workoutName;
    } else {
      title.textContent = "Video not found";
    }
  
    let isPlaying = true;
  
    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (video.paused) {
          video.play();
          playPauseBtn.textContent = "⏸️";
          isPlaying = true;
        } else {
          video.pause();
          playPauseBtn.textContent = "▶️";
          isPlaying = false;
        }
      });
    }
  });
  
  //Dashboard functions 
  document.addEventListener("DOMContentLoaded", async () => {
    if (!window.location.pathname.includes("dashboard.html")) return;
  
    const nameEl = document.getElementById("name");
    const ageEl = document.getElementById("age");
    const genderEl = document.getElementById("gender");
    const weightEl = document.getElementById("weight");
    const heightEl = document.getElementById("height");
    const galleryEl = document.getElementById("workout-gallery");
  
    const email = localStorage.getItem("userEmail");
    if (!email) return;
  
    try {
      
      const res = await fetch(`http://localhost:5000/api/user-data?email=${email}`);
      const user = await res.json();
  
      nameEl.textContent = user.username || "username";
      document.getElementById("ageLine").textContent = `Age: ${user.age}`;
      document.getElementById("genderLine").textContent = `Gender: ${user.gender}`;
      document.getElementById("weightLine").textContent = `Weight: ${user.weight} kg`;
      document.getElementById("heightLine").textContent = `Height: ${user.height} cm`;

      // Load the AI model on dashboard
      const model = await tf.loadLayersModel("AI/AI/tfjs_model/model.json");
      const inputTensor = tf.tensor2d([[
        user.age,
        user.gender === "Male" ? 1 : 0,
        user.weight,
        user.height,
        goalToNumber(user.fitnessGoal)
      ]]);
  
      const prediction = model.predict(inputTensor);
      const predictedClass = prediction.argMax(1).dataSync()[0];
  
      //display workouts 
      const workouts = getWorkoutImages(predictedClass);
      galleryEl.innerHTML = workouts.map(workout => `
        <div class="workout-card" onclick="window.location.href='video-player.html?video=${encodeURIComponent(workout.video)}'">
          <img src="${workout.src}" alt="${workout.name}">
          <p>${workout.name}</p>
        </div>
      `).join("");
  
    } catch (err) {
      console.error("Dashboard error:", err);
      galleryEl.innerHTML = `<p style="color:red;">❌ Failed to load workouts</p>`;
    }
  
    function goalToNumber(goal) {
      const goals = {
        "Weight Loss": 0,
        "Muscle Gain": 1,
        "Endurance": 2,
        "Flexibility": 3,
        "General Fitness": 4
      };
      return goals[goal] ?? 4;
    }
  
    function getWorkoutImages(predictedClass) {
      const workouts = [
        [
          { name: "Full Body HIIT", src: "assets/hiit.jpg", video: "assets/videos/Full_Body_Hiit.mp4" },
          { name: "Intense Burn", src: "assets/hiit2.jpg", video: "assets/videos/Intense_Burn.mp4" },
          { name: "HIIT Express", src: "assets/hiit3.jpg", video: "assets/videos/Hiit_Express.mp4" }
        ],
        [
          { name: "Cardio & Abs", src: "assets/cardio.jpg", video: "assets/videos/Abs_&_Cardio.mp4" },
          { name: "Fat Burner", src: "assets/cardio2.jpg", video: "assets/videos/Fat_Burner.mp4" },
          { name: "Abs Focus", src: "assets/cardio3.jpg", video: "assets/videos/Abs_Focus.mp4" }
        ],
        [
          { name: "Strength Training", src: "assets/strength.jpg", video: "assets/videos/Strength_Training.mp4" },
          { name: "Heavy Lifts", src: "assets/strength2.jpg", video: "assets/videos/Heavy_Lifts.mp4" },
          { name: "Resistance Focus", src: "assets/strength3.jpg", video: "assets/videos/Resistance_Focus.mp4" }
        ],
        [
          { name: "Yoga Flow", src: "assets/yoga.jpg", video: "assets/videos/Yoga.mp4" },
          { name: "Stretch & Calm", src: "assets/yoga2.jpg", video: "assets/videos/Stretch_&_Calm.mp4" },
          { name: "Flexibility Boost", src: "assets/yoga3.jpg", video: "assets/videos/Flexibility_Boost.mp4" }
        ],
        [
          { name: "Daily Fitness", src: "assets/weightloss.jpg", video: "assets/videos/Daily_Fitness.mp4" },
          { name: "All-Around Burn", src: "assets/weightloss2.jpg", video: "assets/videos/All-Around_Burn.mp4" },
          { name: "Balanced Routine", src: "assets/weightloss3.jpg", video: "assets/videos/Balance_Workout.mp4" }
        ]
      ];
      return workouts[predictedClass] || workouts[0];
    }
  });
  
  function logout() {
    localStorage.removeItem("userEmail");
    window.location.href = "index.html"; 
  }
  