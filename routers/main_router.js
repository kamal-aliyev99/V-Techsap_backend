const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling");


//   R O U T E R S     M O D U L E S

const langRouter = require("./lang/lang_router");
const staticImageRouter = require("./staticImage/staticImage_router")
const settingRouter = require("./setting/setting_router")
const staticTextRouter = require("./staticText/staticText_router")








//   EndPoints

router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);

router.use("/staticImage", staticImageRouter);

router.use("/setting", settingRouter);

router.use("/staticText", staticTextRouter);










//   Middlewares

router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END