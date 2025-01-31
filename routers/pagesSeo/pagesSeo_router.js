// URL :  /api/pagesSeo

const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const pagesSeoController = require("../../controllers/pagesSeo/pagesSeo_controller")
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", pagesSeoController.getPagesSeos);

router.get("/:pageOrID", pagesSeoController.getPagesSeoByPageOrID);

router.post("/", authenticateToken, checkAdmin, upload.none(), pagesSeoController.addPagesSeo);

router.patch("/:id", authenticateToken, checkAdmin, upload.none(), checkUpdateIDMiddleware, pagesSeoController.updatePagesSeo);

router.delete("/:id", authenticateToken, checkAdmin, pagesSeoController.deletePagesSeo);



module.exports = router