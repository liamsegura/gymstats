

# Functionality

– Users can track and monitor their gym activities, including workouts, sets, and reps <br>
– Implemented functionality for adding, editing, and deleting workout data<br>
– Enabled users to set fitness goals and track their progress<br>
– Integrated authentication and authorization for secure user access<br>
– Provided data visualization features to analyze fitness trends<br>
– Functionality for creating and joining workout groups, fostering a community-driven environment<br>
– Challenges feature where users can set goals and compete with others<br>
– Charting libraries to provide visual representations of fitness progress<br>
– Subscription-based models to offer premium features and benefits<br>

# Design

– Followed a minimalist design approach with a focus on usability <br>
– Utilized modern design principles to create an intuitive user interface<br>
– Ensured a clean and visually appealing layout for an enhanced user experience<br>

# Technologies Used

– Node.js: Server-side JavaScript runtime<br>
– Express.js: Web application framework for Node.js<br>
– MongoDB: NoSQL database for storing user and workout data<br>
– Cloudinary: Cloud-based media management platform for handling image uploads<br>
– Mongoose: Object Data Modeling (ODM) library for MongoDB, providing relational database features<br>
– SSR generated dynamic HTML views<br>
– HTML/CSS: Front-end languages for creating the user interface<br>
– Chart.js: JavaScript library for data visualization<br>

# Project Overview

– Initialized the app directory using Node.js and Express.js <br>
– Created RESTful API endpoints for managing user and workout data<br>
– Integrated MongoDB for efficient data storage and retrieval<br>
– Implemented user authentication and authorization functionality<br>
– Developed interactive charts to visualize fitness progress<br>

# Issues Faced

– Overcoming challenges in handling complex workout data structures<br>
– Ensuring data integrity and security in user authentication and authorization<br>
– Optimizing performance for efficient data retrieval and rendering<br>

# Development Plans

– Implement functionality for creating and joining workout groups, fostering a community-driven environment<br>
– Develop a challenges feature where users can set goals and compete with others<br>
– Integrate charting libraries to provide visual representations of fitness progress<br>
– Implement subscription-based models to offer premium features and benefits<br>

# Install

`npm install`

---

# Things to add

- Create a `.env` file in config folder and add the following as `key = value`
  - PORT = 2121 (can be any port example: 3000)
  - DB_STRING = `your database URI`
  - CLOUD_NAME = `your cloudinary cloud name`
  - API_KEY = `your cloudinary api key`
  - API_SECRET = `your cloudinary api secret`

---

# Run

`npm start`