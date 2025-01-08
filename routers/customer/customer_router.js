// URL :  /api/customer

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const customerController = require("../../controllers/customer/customer_controller");



//      EndPoints


router.get("/", customerController.getCustomers);

router.get("/homepage", customerController.getHomePageCustomers);

router.get("/:id", customerController.getCustomerByID);

router.post("/", upload("customer-images").single("image"), customerController.addCustomer);  

router.patch("/:id", upload("customer-images").single("image"), checkUpdateIDMiddleware, customerController.updateCustomer);

router.delete("/:id", customerController.deleteCustomer);  



module.exports = router