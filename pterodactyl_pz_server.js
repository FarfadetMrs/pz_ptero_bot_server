var XMLHttpRequest = require('xhr2');
const { server_addr, server_token, server_id } = require('./config.json');
const delay = ms => new Promise(res => setTimeout(res, ms));


//--------------------------------------
//Request to server
//--------------------------------------
function requestCheckIfModNeedUpdate(){
    console.log("requestCheckIfModNeedUpdate");
    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    let response = fetch(url, {
    method: 'POST',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server_token}`
    },
    body: JSON.stringify({ 'command': `checkModsNeedUpdate` })
    });
    return response;

}


function requestConsoleFile(){
    console.log("requestConsoleFile");
    var file_path = ".cache/server-console.txt";
    var url = `${server_addr}/api/client/servers/${server_id}/files/contents?file=${file_path}`;
    let response = fetch(url, {
    method: 'GET',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server_token}`
    }
    });
    return response;

}

function requestRestartServer(){
    console.log("requestRestartServer");
    var url = `${server_addr}/api/client/servers/${server_id}/power`;
    let response = fetch(url, {
    method: 'POST',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server_token}`
    },
    body: JSON.stringify({ 'signal': 'restart' })
    });
    return response;
}

function requestSendMessageToServer(message){
    console.log("requestSendMessageToServer");
    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    let response = fetch(url, {
    method: 'POST',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server_token}`
    },
    body: JSON.stringify({'command': `servermsg "${message}"` })
    });
    return response;
}

function requestPlayers(){
    console.log("requestPlayers");
    var url = `${server_addr}/api/client/servers/${server_id}/command`;
    let response = fetch(url, {
    method: 'POST',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server_token}`
    },
    body: JSON.stringify({ 'command': `players` })
    });
    return response;
}

//-----------------------------------------------------------------------------------
//Function to server
async function doesTheServerNeedsRestart(){
    let reboot_needed = false;
    let response = await requestCheckIfModNeedUpdate();
    if (!response.ok) return reboot_needed;
    await delay(800);
    response = await requestConsoleFile();
    if (!response.ok) return reboot_needed;
    let console_file = await response.text();
    let check_mod_need_update_str = console_file.substring(console_file.lastIndexOf("CheckModsNeedUpdate"),console_file.lastIndexOf("CheckModsNeedUpdate") + 100);
    if (check_mod_need_update_str.includes("Checking...")) reboot_needed = false;
    else if (check_mod_need_update_str.includes("Mods updated")){
        reboot_needed = false;
    }
    else{
        reboot_needed = true;
    }
    return reboot_needed;
}

async function getPlayersInfos(){
    let players_infos = {
        count : 0,
        list : []
    };
    let response = await requestPlayers();
    if (!response.ok) return players_infos;
    await delay(800);
    response = await requestConsoleFile();
    if (!response.ok) return players_infos;
    let console_file = await response.text();
    let players_str = console_file.substring(console_file.lastIndexOf("Players connected"));
    players_infos.count = parseInt(players_str.substring(players_str.indexOf('(')+1,players_str.indexOf(')')));
    let cursor = 0;
    let players_list_str = players_str.substring(players_str.indexOf('-'));
    for (let i = 0; i < players_infos.count; i++) {
        let name = players_list_str.substring(players_list_str.indexOf('-') + 1,players_list_str.indexOf('\n'));
        cursor = name.length + 2;
        players_list_str = players_list_str.substring(cursor);
        players_infos.list.push(name);
    }
    return players_infos;

    
}


module.exports ={
    getPlayersInfos, doesTheServerNeedsRestart, requestSendMessageToServer
}

