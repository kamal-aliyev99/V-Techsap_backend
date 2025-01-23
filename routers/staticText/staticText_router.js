// URL :  /api/staticText?lang=en

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const staticTextController = require("../../controllers/staticText/staticText_controller")
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", staticTextController.getStaticTexts);

router.post("/getDatas", staticTextController.getStaticTextsByKeysArray);

router.get("/:keyOrID", staticTextController.getStaticTextByKeyOrID);

router.post("/", authenticateToken, checkAdmin, upload.none(), staticTextController.addStaticText);

router.patch("/:id", authenticateToken, checkAdmin, upload.none(), checkUpdateIDMiddleware, staticTextController.updateStaticText);

router.delete("/:id", authenticateToken, checkAdmin, staticTextController.deleteStaticText);



module.exports = router