// URL :  /api/customText

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const customTextController = require("../../controllers/customText/customText_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")


//      EndPoints


router.get("/", customTextController.getCustomTexts);

router.post("/getDatas", customTextController.getCustomTextsByKeysArray);

router.get("/:keyOrID", customTextController.getCustomTextByKeyOrID);

router.post("/", authenticateToken, checkAdmin, upload.none(), customTextController.addCustomText);  

router.patch("/:id", authenticateToken, checkAdmin, upload.none(), checkUpdateIDMiddleware, customTextController.updateCustomText);

router.delete("/:id", authenticateToken, checkAdmin, customTextController.deleteCustomText);  


module.exports = router

