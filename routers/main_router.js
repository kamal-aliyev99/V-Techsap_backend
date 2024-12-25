const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling");


// R O U T E R S

const langRouter = require("./lang/lang_router");








// EndPoints

router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);









// Middlewares

router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END