// URL :  /api/team

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const teamController = require("../../controllers/team/team_controller");
const authenticateToken = require("../../middlewares/authenticateToken")
const checkAdmin = require("../../middlewares/checkAdmin")


//      EndPoints


router.get("/", teamController.getTeam);

router.get("/:id", teamController.getTeamByID);  

router.post("/", authenticateToken, checkAdmin, upload("team-images").single("image"), teamController.addTeam);   

router.patch("/:id", authenticateToken, checkAdmin, upload("team-images").single("image"), checkUpdateIDMiddleware, teamController.updateTeam);

router.delete("/:id", authenticateToken, checkAdmin, teamController.deleteTeam);


module.exports = router

