const env = require('dotenv').config();
console.log(env);

const express = require('express');
const cors = require('cors');

// The routes imports
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const registerRouter = require('./routes/registration');
const feedbackRouter = require('./routes/feedbacks');
const institutionRouter = require('./routes/institutions');
const lecturerRouter = require('./routes/lecturers');
const setJSON = require('./middleware/setHeaders');
const myPort = 8588;

const app = express();

app.use(cors()); // enable CORS in our project.
app.use(setJSON);
app.use(express.json()); // To process the incomming request and create the req.body object to be able to handle it 

// use the imported routes
// handles the login procedures
app.use('/api/login', loginRouter);
// this would handle the user's profile
app.use('/api/users', usersRouter);
// this handls the registration procedures
app.use('/api/registration', registerRouter);
// this handles the feedbacks
app.use('/api/feedbacks', feedbackRouter);
// give back all institution from the DB
app.use('/api/institutions', institutionRouter);
// five back all feedbacks connected to an institution
app.use('/api/lecturers', lecturerRouter);




app.listen(myPort, () => console.log(`The server is listenings on port: ${myPort}...`));

// Run the server nodemon index