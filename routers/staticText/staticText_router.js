// URL :  /api/staticText?lang=en

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const staticTextController = require("../../controllers/staticText/staticText_controller")



//      EndPoints


router.get("/", staticTextController.getStaticTexts);

router.post("/getDatas", staticTextController.getStaticTextsByKeysArray);

router.get("/:keyOrID", staticTextController.getStaticTextByKeyOrID);

router.post("/", upload.none(), staticTextController.addStaticText);

router.patch("/:id", upload.none(), checkUpdateIDMiddleware, staticTextController.updateStaticText);

router.delete("/:id", staticTextController.deleteStaticText);



module.exports = router