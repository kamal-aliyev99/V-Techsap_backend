// URL :  /api/service

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const serviceController = require("../../controllers/service/service_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", serviceController.getServices);

router.get("/:slugOrID", serviceController.getServiceBySlugOrID);

router.post("/", authenticateToken, checkAdmin, upload("service-images").fields([
    { name: "image", maxCount: 1 },
    { name: "benefitImage", maxCount: 1 }
]), serviceController.addService);  

router.patch("/:id", authenticateToken, checkAdmin, upload("service-images").fields([
    { name: "image", maxCount: 1 },
    { name: "benefitImage", maxCount: 1 }
]), checkUpdateIDMiddleware, serviceController.updateService);

router.delete("/:id", authenticateToken, checkAdmin, serviceController.deleteService);  



module.exports = router