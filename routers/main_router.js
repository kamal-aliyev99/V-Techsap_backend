const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling");


//   R O U T E R S     M O D U L E S

const langRouter = require("./lang/lang_router");
const staticImageRouter = require("./staticImage/staticImage_router")
const settingRouter = require("./setting/setting_router")
const staticTextRouter = require("./staticText/staticText_router")
const customTextRouter = require("./customText/customText_router")
const partnerRouter = require("./partner/partner_router")
const ourValuesRouter = require("./ourValues/ourValues_router")
const customerRouter = require("./customer/customer_router")
const teamRouter = require("./team/team_router")
const serviceRouter = require("./service/service_router")
const contactBaseRouter = require("./contactBase/contactBase_router")
const userRouter = require("./user/user_router")
const pagesSeoRouter = require("./pagesSeo/pagesSeo_router")








//   EndPoints

router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);

router.use("/staticImage", staticImageRouter);

router.use("/setting", settingRouter);

router.use("/staticText", staticTextRouter);

router.use("/customText", customTextRouter);

router.use("/partner", partnerRouter);

router.use("/ourValues", ourValuesRouter);

router.use("/customer", customerRouter);

router.use("/team", teamRouter);

router.use("/service", serviceRouter);

router.use("/contactBase", contactBaseRouter);

router.use("/auth", userRouter);

router.use("/pagesSeo", pagesSeoRouter); 





//   Middlewares

router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END