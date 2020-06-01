function sendLoginInfo(state){
    $('.alert-danger').hide();
    if(state === 0){    //Login State
        let loginName = document.getElementById("loginName");
        let loginPass = document.getElementById("loginPass");
        $("#loginBtn").hide();
    
        mp.trigger("loginDataToServer", loginName.value, loginPass.value, state);
    }
    else if (state === 1) {   //Register State
        let registerName = document.getElementById("registerName");
        let registerPass = document.getElementById("registerPass");
        let registerPassCompare = document.getElementById("registerPass2");
        $("#registerBtn").hide();
    
        if(registerPass.value === registerPassCompare.value){
            mp.trigger("loginDataToServer", registerName.value, registerPass.value, state);
        } else {
            $(".password-mismatch").show();
            $("#registerBtn").show();
        }
    }
    else {
        return;
    }
}  

function sendPreferredCharacter(preferredCharacter){
    if (preferredCharacter === 1) {   //Choosing First Character
        mp.trigger("characterPreferenceDataToServer", preferredCharacter);

        //$("#character-1").hide();
    }
    else if (preferredCharacter === 2) {   //Choosing Second Character
        mp.trigger("characterPreferenceDataToServer", preferredCharacter);

        //$("#character-2").hide();
    }
    else if (preferredCharacter === 3) {   //Choosing Third Character
        mp.trigger("characterPreferenceDataToServer", preferredCharacter);

        //$("#character-3").hide();
    }    else {
        return;
    }
}  

function sendReadyState(state) {
    if (state === 1) {
        mp.trigger("sendClientToCharacterCreation", state);
    } else {
        mp.trigger("sendClientToCharacterCreation", state);
    }
}  