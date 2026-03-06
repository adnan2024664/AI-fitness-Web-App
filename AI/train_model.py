import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# Load the dataset
df = pd.read_csv("Fitness_Data.csv")

# Encode categorical data
df['gender'] = LabelEncoder().fit_transform(df['gender'])
df['fitnessGoal'] = LabelEncoder().fit_transform(df['fitnessGoal'])
df['workoutPlan'] = LabelEncoder().fit_transform(df['workoutPlan'])

X = df[['age', 'gender', 'weight', 'height', 'fitnessGoal']]
y = df['workoutPlan']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#Build the model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(5,)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(len(y.unique()), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=50, validation_data=(X_test, y_test))


model.save("fitness_model.keras")


