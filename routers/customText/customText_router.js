// URL :  /api/customText

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const customTextController = require("../../controllers/customText/customText_controller");


//      EndPoints


router.get("/", customTextController.getCustomTexts);

router.post("/getDatas", customTextController.getCustomTextsByKeysArray);

router.get("/:keyOrID", customTextController.getCustomTextByKeyOrID);

router.post("/", upload.none(), customTextController.addCustomText);  

router.patch("/:id", upload.none(), checkUpdateIDMiddleware, customTextController.updateCustomText);

router.delete("/:id", customTextController.deleteCustomText);  


module.exports = router

