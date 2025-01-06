// URL :  /api/setting

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const settingController = require("../../controllers/setting/setting_controller")



//      EndPoints


router.get("/", settingController.getSettings);

router.get("/:keyOrID", settingController.getSettingByKeyOrID);

router.post("/getDatas", settingController.getSettingsByKeysArray);

router.post("/", upload.none(), settingController.addSetting);

router.patch("/:id", upload.none(), checkUpdateIDMiddleware, settingController.updateSetting);

router.delete("/:id", settingController.deleteSetting);



module.exports = router