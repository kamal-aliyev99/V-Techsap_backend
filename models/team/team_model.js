const db = require("../../config/db-config");

module.exports = {
    getTeam,
    getTeamWithLang,
    getTeamByID,
    getTeamByIDWithLang,
    addTeam,
    updateTeam,
    deleteTeam
}


//      Get all teams

function getTeam () {
    return db("team");
}


//      Get all teams with Lang

function getTeamWithLang (lang, limit, start) {
    const getData = db("team_translation")
        .join("lang", "team_translation.langCode", "lang.langCode")
        .join("team", "team_translation.team_id", "team.id")
        .select(
            "team.*",
            "team_translation.id as translationID",
            "team_translation.name",
            "team_translation.position",
            "lang.langCode"
        )
        .where("lang.langCode", lang);

    if (limit) {
        return getData.limit(limit)
    } else if (start) {
        return getData.offset(start)
    } else {
        return getData
    }
}


//      Get team by  ID

function getTeamByID (id) {
    return db("team")
        .where({id})
        .first()
}


//      Get team by  ID  with Lang

function getTeamByIDWithLang (id, lang) {
    return db("team_translation")
        .join("lang", "team_translation.langCode", "lang.langCode")
        .join("team", "team_translation.team_id", "team.id")
        .select(
            "team.*",
            "team_translation.id as translationID",
            "team_translation.name",
            "team_translation.position",
            "lang.langCode"
        )
        .where("team.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}




//      Add team

function addTeam (newTeam, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("team").insert(newTeam).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                team_id: id
            }
        })

        await trx("team_translation").insert(translationData);

        return id;
    })
}


//      Update team

function updateTeam (id, teamData, translationData) {
    return db.transaction(async trx => {
        await trx("team")
            .where({id})
            .update(teamData)

        await trx("team_translation")
            .insert(translationData)
            .onConflict(["team_id", "langCode"])
            .merge() 
    })
}


//      Delete team

function deleteTeam (id) {
    return db("team")
        .where({id})
        .del()
}