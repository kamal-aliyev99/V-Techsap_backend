// URL :  /api/customer

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const customerController = require("../../controllers/customer/customer_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")



//      EndPoints


router.get("/", customerController.getCustomers);

router.get("/homepage", customerController.getHomePageCustomers);

router.get("/:id", customerController.getCustomerByID);

router.post("/", authenticateToken, checkAdmin, upload("customer-images").single("image"), customerController.addCustomer);  

router.patch("/:id", authenticateToken, checkAdmin, upload("customer-images").single("image"), checkUpdateIDMiddleware, customerController.updateCustomer);

router.delete("/:id", authenticateToken, checkAdmin, customerController.deleteCustomer);  



module.exports = router