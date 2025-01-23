// URL :  /api/lang

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const langController = require("../../controllers/lang/lang_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")


//   EndPoints

router.get("/", langController.getLangs);  

router.get("/:id", langController.getLangByID);

router.post("/", authenticateToken, checkAdmin, upload("lang-flags").single("image"), langController.addLang)

router.patch("/:id", authenticateToken, checkAdmin, upload("lang-flags").single("image"), checkUpdateIDMiddleware, langController.updateLang)

router.delete("/:id", authenticateToken, checkAdmin, langController.deleteLang)


module.exports = router