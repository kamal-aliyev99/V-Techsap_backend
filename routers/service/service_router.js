// URL :  /api/service

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const serviceController = require("../../controllers/service/service_controller");



//      EndPoints


router.get("/", serviceController.getServices);

// router.get("/:slugOrID", serviceController.getServiceBySlugOrID);

router.post("/", upload("service-images").fields([
    { name: "image", maxCount: 1 },
    { name: "benefitImage", maxCount: 1 }
]), serviceController.addService);  

// router.patch("/:id", checkUpdateIDMiddleware, upload("service-images").single("image"), serviceController.updateService);

// router.delete("/:id", serviceController.deleteService);  



module.exports = router