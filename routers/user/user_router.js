// URL :  /api/auth

const router = require("express").Router();
const multer = require("multer");
const upload = multer(); 
// const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID");
const userController = require("../../controllers/user/user_controller");
const authenticateToken = require("../../middlewares/authenticateToken")


//      EndPoints


// router.get("/allUsers", userController.getUsers);

// router.get("/:id", userController.getUserByID);

router.post("/login", upload.none(), userController.loginUser);

router.post("/register", upload.none(), userController.registerUser);

router.post("/logout", userController.logoutUser);

router.post("/checkLogin", authenticateToken, userController.checkLogin);

// router.patch("/:id", checkUpdateIDMiddleware, userController.updateUser);  

// router.delete("/:id", userController.deleteUser);


module.exports = router

// access token  -> session'da 
// refresh token -> cookie'de  
