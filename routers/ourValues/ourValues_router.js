// URL :  /api/ourValues

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const ourValuesController = require("../../controllers/ourValues/ourValues_controller");



//      EndPoints


router.get("/", ourValuesController.getOurValues);

router.get("/:slugOrID", ourValuesController.getOurValuesBySlugOrID);

router.post("/", upload("ourValues-images").single("image"), ourValuesController.addOurValues);   

router.patch("/:id", upload("ourValues-images").single("image"), checkUpdateIDMiddleware, ourValuesController.updateOurValues);

router.delete("/:id", ourValuesController.deleteOurValues);


module.exports = router

