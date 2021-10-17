const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const nodemailer = require('nodemailer');



const connectDB = require('./config/db');
const { notFound, errorHandler } = require("./middleware/errorMiddleware");


const app = express();

//config env file
dotenv.config();

//Create DB connection
connectDB();

const corsOptions ={
    origin:'*',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}


//Init Middleware - body parser(now it is in Express)
app.use(cors(corsOptions));
app.use(express.json({ extended: false }));


app.get('/', (req, res) => res.send('API Running'));

//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/notices',require('./routes/api/notices'));


// app.use(notFound);
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
