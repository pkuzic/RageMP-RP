var startingBrowser = mp.browsers.new("package://login/index.html");

/* Browsers */
mp.events.add('characterBrowser', (player) => {
    startingBrowser.url = "package://login/characters.html";
    startingBrowser.execute(`$("#firstCharacter-card").hide(); $("#secondCharacter-card").hide(); $("#thirdCharacter-card").hide();`);

    mp.events.callRemote("getUserCharactersIDs", player);
});

mp.events.add("slotUnavailable", (reason) => {
    switch(reason) {
        case "FIRST_SLOT_AVAILABLE": {
            startingBrowser.execute(`$(".first-slot-available").show();`);
            break;
        }
        case "SECOND_SLOT_AVAILABLE": {
            startingBrowser.execute(`$(".second-slot-available").show();`);
            break;
        }
        default: {
            startingBrowser.execute(`$(".other-reason").show();`);
            break;
        }
    }
});

mp.events.add('characterCreationBrowser', (preferredCharacter) => {
    startingBrowser.url = "package://login/character_creation.html";
    startingBrowser.execute(`$('#first-character-tooltip').hide();`);

    if(preferredCharacter === 1) { startingBrowser.execute(`$("#first-character-tooltip").show(); $('#readyBtn-newbie').show();`); } else { startingBrowser.execute(`$('#readyBtn-default').show();`); }
    
});

mp.events.add('playerDoneUsingBrowser', () => {
    startingBrowser.destroy();
    mp.gui.chat.activate(true);
    mp.gui.chat.show(true);
    mp.gui.cursor.show(false, false);
});

/* Data senders */
mp.events.add("loginDataToServer", (user, pass, state) => {
    mp.events.callRemote("sendLoginDataToServer", user, pass, state);
});

mp.events.add("characterPreferenceDataToServer", (preferredCharacter) => {
    mp.events.callRemote("sendCharacterPreferenceDataToServer", preferredCharacter);
});

/* Handlers */
mp.events.add("loginHandler", (handle) => {
    switch(handle){
        case "success":
        {
            mp.gui.chat.push("Вы успешно авторизовались.");
            mp.events.call('characterBrowser');
            //mp.gui.chat.activate(true);
            //mp.gui.cursor.show(false, false);
            
            break;
        }
        case "registered":
        {
            mp.gui.chat.push("Вы успешно зарегистрировались.");
            mp.events.call('characterBrowser');
            //mp.gui.chat.activate(true);
            //mp.gui.cursor.show(false, false);

            break;
        }
        case "incorrectinfo":
        {
            startingBrowser.execute(`$(".incorrect-info").show(); $("#loginBtn").show();`);
            break;
        }
        case "takeninfo":
        {
            startingBrowser.execute(`$(".taken-info").show(); $("#registerBtn").show();`);
            break;
        }
        case "tooshort":
        {
            startingBrowser.execute(`$(".short-info").show(); $("#registerBtn").show();`);
            break;
        }
        case "logged":
        {
            startingBrowser.execute(`$(".logged").show(); $("#loginBtn").show();`);
            break;
        }
        default:
        {
            break;
        }
    }
});

mp.events.add("characterHandler", (handle) => {
    switch(handle){
        case "character1":
        {
            /*mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);*/
            mp.events.call('playerDoneUsingBrowser');
            //mp.events.call('characterCreationBrowser');

            break;
        }
        case "character2":
        {
            /*mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);*/
            mp.events.call('playerDoneUsingBrowser');
            //mp.events.call('characterCreationBrowser');

            break;
        }
        case "character3":
        {
            /*mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);*/
            mp.events.call('playerDoneUsingBrowser');
            //mp.events.call('characterCreationBrowser');

            break;
        }
        default:
        {
            break;
        }
    }
});

mp.events.add("spawnExistingCharacter", (handle) => {
    switch(handle){
        case "character1":
        {
            mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);
            mp.events.call('playerDoneUsingBrowser');

            //load character here

            break;
        }
        case "character2":
        {
            mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);
            mp.events.call('playerDoneUsingBrowser');

            //load character here

            break;
        }
        case "character3":
        {
            mp.gui.chat.activate(true);
            mp.gui.cursor.show(false, false);
            mp.events.call('playerDoneUsingBrowser');

            //load character here

            break;
        }
        default:
        {
            break;
        }
    }
});

mp.events.add("sendCharactersToClient", (values, state) => {
    //mp.gui.chat.push(`Characters' IDs: ${values}, state: ${state}`) //debug purposes
    
    //Takes characters from the array respectively to the id of a character
    var firstCharacterId = values[0];
    var secondCharacterId = values[1];
    var thirdCharacterId = values[2];

    if(state === 1) { //updateCharactersPage state
        mp.events.callRemote('getCharactersMinimalDataFromServer', firstCharacterId, secondCharacterId, thirdCharacterId);
    } else {
        return mp.gui.chat.push(`Unknown state. Why sendCharactersToClient has been called? State: ${state}`) //debug purposes
    }
});

mp.events.add("updateCharactersPage", (firstCharacterFirstName, firstCharacterSurname, firstCharacterRole,
    secondCharacterFirstName, secondCharacterSurname, secondCharacterRole,
    thirdCharacterFirstName, thirdCharacterSurname, thirdCharacterRole) => {

    startingBrowser.execute(`$('#spinner-progress').show();`);
    
    pageContentLoader = () => {
        startingBrowser.execute(`document.getElementById('character-1-name').innerHTML="${firstCharacterFirstName} ${firstCharacterSurname}"`);
        startingBrowser.execute(`document.getElementById('character-2-name').innerHTML="${secondCharacterFirstName} ${secondCharacterSurname}"`);
        startingBrowser.execute(`document.getElementById('character-3-name').innerHTML="${thirdCharacterFirstName} ${thirdCharacterSurname}"`);

        startingBrowser.execute(`document.getElementById('character-1-role').innerHTML="${firstCharacterRole}"`);
        startingBrowser.execute(`document.getElementById('character-2-role').innerHTML="${secondCharacterRole}"`);
        startingBrowser.execute(`document.getElementById('character-3-role').innerHTML="${thirdCharacterRole}"`);

        startingBrowser.execute(`$("#firstCharacter-card").show();`);
        startingBrowser.execute(`$("#secondCharacter-card").show();`);
        startingBrowser.execute(`$("#thirdCharacter-card").show();`);
        return;
    }

    const loadUpdateCharactersPage = new Promise((finishLoadingPage) => {
        pageContentLoader();
        finishLoadingPage();  
    });
    loadUpdateCharactersPage.then(() => {
        startingBrowser.execute(`$('#spinner-progress').hide();`);
    })
});

mp.events.add("sendClientToCharacterCreation", (state) => {
    mp.events.call('playerDoneUsingBrowser');
})