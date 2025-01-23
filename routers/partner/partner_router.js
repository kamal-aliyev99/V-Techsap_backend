// URL :  /api/partner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const partnerController = require("../../controllers/partner/partner_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", partnerController.getPartners);

router.get("/:id", partnerController.getPartnerByID);

router.post("/", authenticateToken, checkAdmin, upload("partner-images").single("image"), partnerController.addPartner);  

router.patch("/:id", authenticateToken, checkAdmin, upload("partner-images").single("image"), checkUpdateIDMiddleware, partnerController.updatePartner);

router.delete("/:id", authenticateToken, checkAdmin, partnerController.deletePartner);  



module.exports = router