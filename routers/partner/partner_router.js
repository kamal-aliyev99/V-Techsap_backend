// URL :  /api/partner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const partnerController = require("../../controllers/partner/partner_controller");



//      EndPoints


router.get("/", partnerController.getPartners);

router.get("/:id", partnerController.getPartnerByID);

router.post("/", upload("partner-images").single("image"), partnerController.addPartner);  

router.patch("/:id", upload("partner-images").single("image"), checkUpdateIDMiddleware, partnerController.updatePartner);

router.delete("/:id", partnerController.deletePartner);  



module.exports = router