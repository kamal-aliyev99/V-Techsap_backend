// URL :  /api/staticImage

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const staticImageController = require("../../controllers/staticImage/staticImage_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", staticImageController.getStaticImages);

router.post("/getDatas", staticImageController.getStaticImagesByKeysArray);

router.get("/:keyOrID", staticImageController.getStaticImageByKeyorID);

router.post("/", authenticateToken, checkAdmin, upload("static-Images").single("image"), staticImageController.addStaticImage);  

router.patch("/:id", authenticateToken, checkAdmin, upload("static-Images").single("image"), checkUpdateIDMiddleware, staticImageController.updateStaticImage);

router.delete("/:id", authenticateToken, checkAdmin, staticImageController.deleteStaticImage);  



module.exports = router