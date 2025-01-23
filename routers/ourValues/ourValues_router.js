// URL :  /api/ourValues

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const ourValuesController = require("../../controllers/ourValues/ourValues_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", ourValuesController.getOurValues);

router.get("/:slugOrID", ourValuesController.getOurValuesBySlugOrID);

router.post("/", authenticateToken, checkAdmin, upload("ourValues-images").single("image"), ourValuesController.addOurValues);   

router.patch("/:id", authenticateToken, checkAdmin, upload("ourValues-images").single("image"), checkUpdateIDMiddleware, ourValuesController.updateOurValues);

router.delete("/:id", authenticateToken, checkAdmin, ourValuesController.deleteOurValues);


module.exports = router

