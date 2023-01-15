var XMLHttpRequest = require('xhr2');
const { server_addr, server_token, server_id } = require('./config.json');


//Function pour redemarrer le serveur PZ
const restartServer = () => {
    console.log("restartServer");
    var url = `${server_addr}/api/client/servers/${server_id}/power`;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${server_token}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    xhr.send(JSON.stringify({ 'signal': 'restart' }));
}


//Function pour recuperer le contenu du fichier server-console.txt
const getConsoleFileContent = (callback) => {
    console.log("getConsoleFileContent");
    var file_path = ".cache/server-console.txt";
    var url = `${server_addr}/api/client/servers/${server_id}/files/contents?file=${file_path}`;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${server_token}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status > 199 && xhr.status < 300) {
                if (callback) callback(xhr.responseText);
            }

        }
    };

    xhr.send();
}

//Function pour envoyer un message à tout le monde sur le serveur PZ
const sendMessageToServer = (message) => {
    console.log("sendMessageToServer");
    console.log(`Message : ${message}`);
    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${server_token}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(`sendMessageToServer ${xhr.status}`);
        }
    };

    xhr.send(JSON.stringify({ 'command': `servermsg "${message}"` }));
}


//Function pour connaitre le nombre de joueur connectés 
const getPlayersOnline = (callback) =>{
    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${server_token}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(`players => request result: ${xhr.status}`);
            if (xhr.status > 199 && xhr.status < 300) {
                console.log("Wait for console.txt be filled...")
                //Get file content console.txt after few ms
                setTimeout(() => {
                    getConsoleFileContent(function (file_content) {
                        const str_mod = file_content.slice(file_content.length - 500);
                        let sub_str_mod = str_mod.substring(str_mod.search("Players connected"));
                        //console.log(sub_str_mod);
                        let player_number = parseInt(sub_str_mod.substring(sub_str_mod.indexOf('(')+1,sub_str_mod.indexOf(')')));
                        let players = [];
                        let cursor = 0;
                        let sub_str_name = sub_str_mod.substring(sub_str_mod.indexOf('-'));
                        //console.log(sub_str_name);
                        for (let i = 0; i < player_number; i++) {
                            
                            let name = sub_str_name.substring(sub_str_name.indexOf('-') + 1,sub_str_name.indexOf('\n'));
                            //console.log(`Name : ${name}`);
                            cursor = name.length + 2;
                            sub_str_name = sub_str_name.substring(cursor);
                            players.push(name);
                          }
                        if (callback) callback({"count":player_number, "list":players});
                    });
                },
                    500);
            }
            else {
                console.error("Request error");
            }
        }
    };

    xhr.send(JSON.stringify({ 'command': `players` }));
}

//Function pour savoir si un mod a été mis a jour ou pas : return bool
const checkIfModNeedsUpdate = (callback) => {
    console.log("Check if a mod has been updated...")
    const mod_updated_sentence = "Mods updated"

    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${server_token}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(`checkIfModNeedsUpdate => request result: ${xhr.status}`);
            if (xhr.status > 199 && xhr.status < 300) {
                console.log("Wait for console.txt be filled...")
                //Get file content console.txt after few ms
                setTimeout(() => {
                    getConsoleFileContent(function (file_content) {
                        const str_mod = file_content.substring(file_content.lastIndexOf("CheckModsNeedUpdate"),file_content.lastIndexOf("CheckModsNeedUpdate") + 100);
                        console.log(str_mod);
                        if (str_mod.includes("Checking...")) return;
                        if (str_mod.includes(mod_updated_sentence)) {
                            console.log("Les mods sont a jour");
                        }
                        else {
                            console.log("Les mods ne sont pas a jour");
                        }
                        if (callback) callback(!str_mod.includes(mod_updated_sentence));
                    });
                },
                    1000);
            }
            else {
                console.error("Request error");
            }
        }
    };

    xhr.send(JSON.stringify({ 'command': `checkModsNeedUpdate` }));

}
module.exports ={
    getPlayersOnline, checkIfModNeedsUpdate,restartServer,sendMessageToServer
}

//Tests
// getPlayersOnline(function (need_update) {
//     console.log(need_update);
// });

// checkIfModNeedsUpdate(function (need_update) {
//     console.log(`MAJ mod  : ${need_update}`);
// });