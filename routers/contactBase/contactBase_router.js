// URL :  /api/contactBase

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const contactBaseController = require("../../controllers/contactBase/contactBase_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")


//      EndPoints


router.get("/", contactBaseController.getContactBase);

router.get("/:id", contactBaseController.getContactBaseByID);

router.post("/", upload.none(), contactBaseController.addContactBase);  

router.patch("/:id", authenticateToken, checkAdmin, upload.none(), checkUpdateIDMiddleware, contactBaseController.updateIsReadContactBase);  

router.delete("/:id", authenticateToken, checkAdmin, contactBaseController.deleteContactBase);


module.exports = router

