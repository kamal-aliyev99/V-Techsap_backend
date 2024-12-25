require("dotenv").config();

const express = require("express");
const server = express();
const cors = require("cors");
const path = require("path");

server.use(cors());
server.use(express.json());
server.use('/public', express.static(path.join(__dirname, 'public')));


//      R O U T E R

const mainRouter = require("./routers/main_router")

server.use("/api", mainRouter);

const PORT = 3080

server.listen(PORT, () => {
    console.log("http://localhost:3080 is ready"); 
})




//      FOR PRODUCTION
// const PORT = process.env.PORT || 443;  // 80-http ; 443 - https
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




