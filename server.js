const server =  require('./pterodactyl_pz_server.js')
const { time_before_reboot_s,check_mod_state_interval,channel_information } = require('./config.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

var reboot_sequence_on = false;


const startLoopCheckingMod = (client) => {
    setInterval(() => {
            if (!reboot_sequence_on){CheckModOnServer(client);}
            else{console.log("Reboot sequence en cours");}
        }, check_mod_state_interval*1000);
        
}

async function CheckModOnServer(client){

    client.user.setActivity("check mod");

    let server_need_reboot =await server.doesTheServerNeedsRestart();
    console.log("Le serveur need restart  = ", server_need_reboot);
    if (server_need_reboot)
    {
        client.user.setActivity("rebooting");
        let result =await rebootSequence(client);
        console.log("Fini");
    }
    client.user.setActivity("rien");

}


async function rebootSequence(client) {
    reboot_sequence_on = true;
    console.log("Reboot Sequence Started");
    let max_step = 10;
    let actual_step = max_step;
    client.channels.cache.get(channel_information).send(`🚨 REBOOT 🚨 Suite a une mise a jour de Mods, un reboot est nécessaire. Il aura lieu dans ${time_before_reboot_s / 60} minutes`);
    console.log(`Redémarrage du serveur dans ${(time_before_reboot_s / 60)*(actual_step/max_step)} minutes`);
    while(actual_step > 0)
    {   
        await delay((time_before_reboot_s/max_step) * 1000);
        actual_step = actual_step -1;
        console.log(`Redémarrage du serveur dans ${(time_before_reboot_s / 60)*(actual_step/max_step)} minutes`);
        client.channels.cache.get(channel_information).send(`🚨 REBOOT 🚨 Redémarrage du serveur dans ${(time_before_reboot_s / 60)*(actual_step/max_step)} minutes`);
    }
    client.channels.cache.get(channel_information).send(`....Rebooting.....`);
    console.log(`....Rebooting.....`);
    reboot_sequence_on = false;
}



module.exports ={
    startLoopCheckingMod
}