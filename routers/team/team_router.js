// URL :  /api/team

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const teamController = require("../../controllers/team/team_controller");



//      EndPoints


router.get("/", teamController.getTeam);

router.get("/:id", teamController.getTeamByID);  

router.post("/", upload("team-images").single("image"), teamController.addTeam);   

router.patch("/:id", upload("team-images").single("image"), checkUpdateIDMiddleware, teamController.updateTeam);

router.delete("/:id", teamController.deleteTeam);


module.exports = router

