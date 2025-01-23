// URL :  /api/setting

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const settingController = require("../../controllers/setting/setting_controller")
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", settingController.getSettings);

router.post("/getDatas", settingController.getSettingsByKeysArray);  // getDatas is special keyword,, key can't be "getDatas !!!"

router.get("/:keyOrID", settingController.getSettingByKeyOrID);

router.post("/", authenticateToken, checkAdmin, upload.none(), settingController.addSetting);

router.patch("/:id", authenticateToken, checkAdmin, upload.none(), checkUpdateIDMiddleware, settingController.updateSetting);

router.delete("/:id", authenticateToken, checkAdmin, settingController.deleteSetting);



module.exports = router