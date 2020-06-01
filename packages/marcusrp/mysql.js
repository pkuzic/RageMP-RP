var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

module.exports =
{
    handle: null,

    connect: function(call){
        this.handle = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'marcusrp'
        });

        this.handle.connect(function (err){
            if(err){
                switch(err.code){
                    case "ECONNREFUSED":
                        console.log("\x1b[93m[MySQL] \x1b[97mError: Check your connection details (packages/mysql/mysql.js) or make sure your MySQL server is running. \x1b[39m");
                        break;
                    case "ER_BAD_DB_ERROR":
                        console.log("\x1b[91m[MySQL] \x1b[97mError: The database name you've entered does not exist. \x1b[39m");
                        break;
                    case "ER_ACCESS_DENIED_ERROR":
                        console.log("\x1b[91m[MySQL] \x1b[97mError: Check your MySQL username and password and make sure they're correct. \x1b[39m");
                        break;
                    case "ENOENT":
                        console.log("\x1b[91m[MySQL] \x1b[97mError: There is no internet connection. Check your connection and try again. \x1b[39m");
                        break;
                    default:
                        console.log("\x1b[91m[MySQL] \x1b[97mError: " + err.code + " \x1b[39m");
                        break;
                }
            } else {
                console.log("\x1b[92m[MySQL] \x1b[97mConnected Successfully \x1b[39m");
            }
        });
    }
};

mp.events.add("sendLoginDataToServer", (player, username, pass, state) => {
    let loggedAccount = mp.players.toArray().find(p => p.loggedInAs == username);
    switch(state){
        case 0: //Login State
        {
            if(loggedAccount){
                console.log("Logged in already.");
                player.call("loginHandler", ["logged"]);
            } else {
                gm.mysql.handle.query('SELECT `password` FROM `accounts` WHERE `username` = ?', [username], function(err, res){
                    if(res.length > 0){
                        let sqlPassword = res[0]["password"];
                        bcrypt.compare(pass, sqlPassword, function(err, res2) {
                            if(res2 === true){  //Password is correct
                                player.name = username;
                                player.call("loginHandler", ["success"]);
                                gm.auth.loadAccount(player);
                            } else {    //Password is incorrect
                                player.call("loginHandler", ["incorrectinfo"]);
                            }
                        });
                    } else {
                        player.call("loginHandler", ["incorrectinfo"]);
                    }
                });
            }
            break;
        }
        case 1: //Register State
        {
            if(username.length >= 3 && pass.length >= 5){
                gm.mysql.handle.query('SELECT * FROM `accounts` WHERE `username` = ?', [username], function(err, res){
                    if(res.length > 0){
                        player.call("loginHandler", ["takeninfo"]);
                    } else {
                        bcrypt.hash(pass, null, null, function(err, hash) {
                            if(!err){
                                gm.mysql.handle.query('INSERT INTO `accounts` SET username = ?, password = ?', [username, hash], function(err, res){
                                    if(!err){
                                        player.name = username;
                                        player.call("loginHandler", ["registered"]);
                                        gm.auth.registerAccount(player);
                                        console.log(`\x1b[94m[AUTH] \x1b[97m${username} has just registered.\x1b[39m`);
                                    } else {
                                        console.log("\x1b[31m[ERROR] " + err)
                                    }
                                });
                            } else {
                                console.log("\x1b[31m[BCrypt]: " + err)
                            }
                        });
                    }
                });
            } else {
                player.call("loginHandler", ["tooshort"]);
            }    
            break;
        }
        default:
        {
            player.outputChatBox("Случилась ошибка, сообщите о ней администрации сервера.")
            console.log("\x1b[31m[ERROR] Login/Register state was one that isn't defined. State: " + state)
            break;
        }
    }    
});

mp.events.add("sendCharacterPreferenceDataToServer", (player, preferredCharacter) => {
    switch(preferredCharacter) {
        case 1: 
        {
            gm.mysql.handle.query('SELECT `character1` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
                slot1 = result[0].character1;
                if(slot1 != 0){
                    //player.outputChatBox("OK CHARACTER1 IS 0")
                    player.call("spawnExistingCharacter", ["character1"]);

                } else {
                    //player.outputChatBox("OK CHARACTER1 ISNT 0")
                    player.call("characterCreationBrowser", [preferredCharacter])
                }
            });
            break;
        }
        case 2: 
        {
            gm.mysql.handle.query('SELECT `character1`, `character2` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
                slot1 = result[0].character1;
                slot2 = result[0].character2;
                if(slot2 != 0){ //If this slot IS NOT 0, then spawnExistingCharacter
                    player.call("spawnExistingCharacter", ["character2"]);
                } else if (slot1 === 0) { //If FIRST SLOT IS NOT FILLED, then state this slot is unavailable
                    let reason = "FIRST_SLOT_AVAILABLE";
                    player.call("slotUnavailable", [reason]);
                } else {
                    player.call("characterCreationBrowser", [preferredCharacter])
                }
            });
            break;
        }
        case 3: 
        {
            gm.mysql.handle.query('SELECT `character1`, `character2`, `character3` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
                slot1 = result[0].character1;
                slot2 = result[0].character2;
                slot3 = result[0].character3;
                if(slot3 != 0){ //If this slot IS NOT 0, then spawnExistingCharacter
                    player.call("spawnExistingCharacter", ["character3"]);
                }
                else if (slot2 === 0) {//If SECOND SLOT IS NOT FILLED, then state this slot is unavailable
                    let reason = "SECOND_SLOT_AVAILABLE";
                    player.call("slotUnavailable", [reason]);
                } else {
                    player.call("characterCreationBrowser", [preferredCharacter])
                }
            });
            break;
        }
        default:
        {
            player.outputChatBox("Случилась ошибка, сообщите о ней администрации сервера.")
            console.log("\x1b[31m[ERROR] preferredCharacter was one that isn't defined. preferredCharacter: " + preferredCharacter)
            break;
        }
    }
});

mp.events.add("getUserCharactersIDs", (player, character1, character2, character3) => {
    playerName = player.name;
    
    //Character 1
    const getFirstCharacterPromise = new Promise((getCharacterId) => {
        gm.mysql.handle.query('SELECT `character1`, `character2`, `character3` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
            getCharacterId(character1 = result[0].character1);  
        });
    });
    //Character 2
    const getSecondCharacterPromise = new Promise((getCharacterId) => {
        gm.mysql.handle.query('SELECT `character1`, `character2`, `character3` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
            getCharacterId(character2 = result[0].character2);  
        });
    });
    //Character 3
    const getThirdCharacterPromise = new Promise((getCharacterId) => {
        gm.mysql.handle.query('SELECT `character1`, `character2`, `character3` FROM `accounts` WHERE `username` = ?', [player.name], function(err, result, fields){
            getCharacterId(character3 = result[0].character3);  
        });
    });

    Promise.all([getFirstCharacterPromise, getSecondCharacterPromise, getThirdCharacterPromise]).then((values) => {
        var state = 1; //Used for calling updateCharactersPage
        //console.log(values) //debug purposes
        player.call("sendCharactersToClient", [values, state]);
    });
});

mp.events.add("getCharactersMinimalDataFromServer", (player, firstCharacterId, secondCharacterId, thirdCharacterId) => {
    const getFirstCharacterMinimalDatarPromise = new Promise((getCharacterMinimalData) => {
        gm.mysql.handle.query('SELECT `name`, `surname`, `role` FROM `characters` WHERE `id` = ?', [firstCharacterId], function(err, result, fields){
            getCharacterMinimalData(firstResult = result);  
        });
    });    
    const getSecondCharacterMinimalDatarPromise = new Promise((getCharacterMinimalData) => {
        gm.mysql.handle.query('SELECT `name`, `surname`, `role` FROM `characters` WHERE `id` = ?', [secondCharacterId], function(err, result, fields){
            getCharacterMinimalData(secondResult = result);  
        });
    });    
    const getThirdCharacterMinimalDatarPromise = new Promise((getCharacterMinimalData) => {
        gm.mysql.handle.query('SELECT `name`, `surname`, `role` FROM `characters` WHERE `id` = ?', [thirdCharacterId], function(err, result, fields){
            getCharacterMinimalData(thirdResult = result);  
        });
    });  
    Promise.all([getFirstCharacterMinimalDatarPromise, getSecondCharacterMinimalDatarPromise, getThirdCharacterMinimalDatarPromise]).then((data) => {

        let firstCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[0]))
        let secondCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[1]))
        let thirdCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[2]))

        //Parse first character
        var firstCharacterFirstName = firstCharacterResult[0].name
        var firstCharacterSurname = firstCharacterResult[0].surname
        var firstCharacterRole = firstCharacterResult[0].role
        
        //Parse second character
        var secondCharacterFirstName = secondCharacterResult[0].name
        var secondCharacterSurname = secondCharacterResult[0].surname
        var secondCharacterRole = secondCharacterResult[0].role

        //Parse third character
        var thirdCharacterFirstName = thirdCharacterResult[0].name
        var thirdCharacterSurname = thirdCharacterResult[0].surname
        var thirdCharacterRole = thirdCharacterResult[0].role

        const getFirstCharacterRoleName = new Promise((getRoleString) => {
            gm.mysql.handle.query('SELECT `rolename` FROM `roles` WHERE `id` = ?', [firstCharacterRole], function(err, result, fields){
                getRoleString(firstResult = result);  
            });
        });    
        const getSecondCharacterRoleName = new Promise((getRoleString) => {
            gm.mysql.handle.query('SELECT `rolename` FROM `roles` WHERE `id` = ?', [secondCharacterRole], function(err, result, fields){
                getRoleString(secondResult = result);  
            });
        });    
        const getThirdCharacterRoleName = new Promise((getRoleString) => {
            gm.mysql.handle.query('SELECT `rolename` FROM `roles` WHERE `id` = ?', [thirdCharacterRole], function(err, result, fields){
                getRoleString(thirdResult = result);  
            });
        });
        Promise.all([getFirstCharacterRoleName, getSecondCharacterRoleName, getThirdCharacterRoleName]).then((data) => {
            let firstCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[0]))
            let secondCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[1]))
            let thirdCharacterResult = JSON.parse(JSON.stringify(Object.values(data)[2]))    

            var firstCharacterRoleName = firstCharacterResult[0].rolename
            var secondCharacterRoleName = secondCharacterResult[0].rolename
            var thirdCharacterRoleName = thirdCharacterResult[0].rolename


            player.call("updateCharactersPage", [firstCharacterFirstName, firstCharacterSurname, firstCharacterRoleName,
                secondCharacterFirstName, secondCharacterSurname, secondCharacterRoleName,
                thirdCharacterFirstName, thirdCharacterSurname, thirdCharacterRoleName]);

        });

    });  
})

mp.events.add("playerQuit", (player) => {
    if(player.loggedInAs != ""){ //prevents saving users who aren't logged in
        gm.auth.saveAccount(player);
    } else {
        //console.log(`${player.name} left the server unlogged.`)//debug purposes
    }
});

mp.events.add("playerJoin", (player) => {
    console.log(`\x1b[94m[AUTH] \x1b[97m${player.name} has joined the server.\x1b[39m`);
    player.loggedInAs = "";
    player.spawn(new mp.Vector3(-425.517, 1123.620, 325.8544));  
});