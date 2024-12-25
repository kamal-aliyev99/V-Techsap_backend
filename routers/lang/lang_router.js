// URL :  /api/lang

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const langController = require("../../controllers/lang/lang_controller");


//   EndPoints

router.get("/", langController.getLangs);  

router.get("/:id", langController.getLangByID);

router.post("/", upload("lang-flags").single("image"), langController.addLang)

router.patch("/:id", upload("lang-flags").single("image"), checkUpdateIDMiddleware, langController.updateLang)

router.delete("/:id", langController.deleteLang)


module.exports = router