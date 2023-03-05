const sequelize = require('sequelize');
const auth = require('../config/auth.json');
const bcrypt = require('bcryptjs');
const PlayerModel = require('../database/models/Player');
const RegisterModel = require('../database/models/Register');
const config = require('config');
const db = require('../database');
const moment = require('moment');
const requestIp = require('request-ip');
const jwt = require('jsonwebtoken');
const functions = require('../modules/functions');


module.exports = {
    async getStaffs(req, res) {
        try {
            var newArrPlayer = [];
            var newArrStaff = [];
		
            const ranks = await db.query("SELECT id, `name`, badgeid, `function` FROM ranks WHERE (id >= 6 and id <= 9) or id = 12 ORDER BY id DESC", {
                type: sequelize.QueryTypes.SELECT
            });

            for (var i = 0; i < ranks.length; i++) {
                newArrPlayer = [];
                const staffs = await db.query("SELECT id,username,figure,motto,`online`,last_online,oculto FROM players WHERE `rank` = ?", {
                    replacements: [ ranks[i].id ], type: sequelize.QueryTypes.SELECT
                })



                for (var s = 0; s < staffs.length; s++) {
                    const userSettings = await PlayerModel.findByPk(parseInt(staffs[s].id), { 
                        include: { association: 'getSettingsUser' }
                    });
                    
                    if (staffs[s].oculto == '0') {
                        newArrPlayer.push({
                            username: staffs[s].username,
                            figure: staffs[s].figure,
                            motto: staffs[s].motto,
                            online: staffs[s].online == '1' && userSettings.getSettingsUser[0].hide_online == '0',
                            last_online: await functions.userSettingsById('hide_last_online', staffs[s].id) == '0' ? staffs[s].last_online : null,
                        });
                    }
                }
                     
                newArrStaff.push({
                    name: ranks[i].name,
					badge: ranks[i].badgeid,
                    function: ranks[i].function,
                    players: newArrPlayer
                });
            }

            return res.status(200).json(newArrStaff);
        } catch (error) {
            return res.status(200).json(error);
        }
    },
	
    async getColab(req, res) {
        try {
            var newArrPlayer = [];
            var newArrStaff = [];
			
            const ranks = await db.query("SELECT id, `name`, badge, `page`, `function` FROM cms_ranks ORDER BY id DESC", {
                type: sequelize.QueryTypes.SELECT
            });

            for (var i = 0; i < ranks.length; i++) {
                newArrPlayer = [];
				const getPlayers = await db.query("SELECT player_id FROM cms_user_ranks WHERE rank_id = ?", {
					replacements: [ ranks[i].id ], type: sequelize.QueryTypes.SELECT
				});
				
				for (var p = 0; p < getPlayers.length; p++) {
					const staffs = await db.query("SELECT id,username,figure,motto,`online`,last_online,oculto FROM players WHERE `id` = ?", {
						replacements: [ getPlayers[p].player_id ], type: sequelize.QueryTypes.SELECT
					})	

					for (var s = 0; s < staffs.length; s++) {
						const userSettings = await PlayerModel.findByPk(parseInt(staffs[s].id), { 
							include: { association: 'getSettingsUser' }
						});
						
						if (staffs[s].oculto == '0') {
							newArrPlayer.push({
								username: staffs[s].username,
								figure: staffs[s].figure,
								motto: staffs[s].motto,
								online: staffs[s].online == '1' && userSettings.getSettingsUser[0].hide_online == '0',
								last_online: await functions.userSettingsById('hide_last_online', staffs[s].id) == '0' ? staffs[s].last_online : null,
							});
						}
					}					
				}

                newArrStaff.push({
                    name: ranks[i].name,
					badge: ranks[i].badge,
					page: ranks[i].page,
                    function: ranks[i].function,
                    players: newArrPlayer
                });
            }

            return res.status(200).json(newArrStaff);
        } catch (error) {
            return res.status(200).json(error);
        }
    }
}