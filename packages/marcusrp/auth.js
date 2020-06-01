module.exports =
{
    registerAccount: function(player){
        /*player.data.money = 5000;
        player.position = new mp.Vector3(15, 15, 71);   //  Use the same values that are default inside your DB
        player.health = 100;
        player.armour = 50;*/
        player.loggedInAs = player.name;
    },
    /*saveAccount: function(player){
        gm.mysql.handle.query('UPDATE `accounts` SET money = ?, posX = ?, posY = ?, posZ = ?, health = ?, armour = ? WHERE username = ?', [player.data.money, player.position.x.toFixed(2), player.position.y.toFixed(2), player.position.z.toFixed(2), player.health, player.armour, player.name], function(err, res, row){
            if(err) console.log(err);
        });
    },*/
    loadAccount: function(player){
        gm.mysql.handle.query('SELECT * FROM `accounts` WHERE username = ?', [player.name], function(err, res, row){
            if(err) console.log(err);
            if(res.length){
                res.forEach(function(playerData){
                    //player.name = playerData.username;
                    player.loggedInAs = playerData.username;

                    /*player.data.money = playerData.money;
                    player.position = new mp.Vector3(playerData.posX, playerData.posY, playerData.posZ);
                    player.health = playerData.health;
                    player.armour = playerData.armour;*/

                    //TBD!!!
                    /*player.character1 = playerData.character1;
                    player.character2 = playerData.character2;
                    player.character2 = playerData.character3;*/
                });
            }
        });
        console.log(`\x1b[94m[AUTH] \x1b[97m${player.name} has logged in.\x1b[39m`);
    }
}