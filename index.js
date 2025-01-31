require("dotenv").config();

const express = require("express");
const server = express();
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const cookieParser = require("cookie-parser"); 

server.use(cors({
    origin: "http://localhost:3000", 
    credentials: true // Cookie göndərilməsi üçün 
}));
server.use(express.json());
server.use(cookieParser());
server.use('/public', express.static(path.join(__dirname, 'public')));


//      R O U T E R

const mainRouter = require("./routers/main_router")

server.use("/api", mainRouter);


const PORT = process.env.PORT || 3080   // 80-http ; 443 - https
const HOST = process.env.HOST || '0.0.0.0'; // Host təyini, əks halda bütün interfeysləri dinləyəcək
server.listen(PORT, HOST, () => {
    PORT == 3080 ? console.log("http://localhost:3080 is ready") : 
    console.log(`Server is running on port ${PORT}`);  
})


