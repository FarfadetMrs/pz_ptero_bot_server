const server =  require('./pterodactyl_pz_server.js')
const { time_before_reboot_s,check_mod_state_interval,channel_general } = require('./config.json');


var reboot_sequence_on = false;

const startLoopCheckingMod = (client) => {
    setInterval(() => {
        if (!reboot_sequence_on){
            server.checkIfModNeedsUpdate(function (need_update) {
                if (need_update){
                    console.log("Mods need an update");
                    startRebootSequence(client);
                }
                else{
                    console.log("No Mod updated yet");
                }
            });
        }
        }, check_mod_state_interval*1000)
        
}

const startRebootSequence = (client) =>{
    console.log("startRebootSequence");
    reboot_sequence_on = true;
    let max_step = 10;
    let actual_step = max_step
    client.channels.cache.get(channel_general).send(`🚨 REBOOT 🚨 Suite a une mise a jour de Mods, un reboot est nécessaire. Il aura lieu dans ${time_before_reboot_s / 60} minutes`);
    setInterval(()=> {
        if (actual_step == 0){
            client.channels.cache.get(channel_general).send(`....Rebooting.....`);
            reboot_sequence_on = false;
        }
        actual_step = actual_step -1;
        client.channels.cache.get(channel_general).send(`🚨 REBOOT 🚨 Redémarrage du serveur dans ${(time_before_reboot_s / 60)*(actual_step/max_step)} minutes`);
        
    },time_before_reboot_s/max_step * 1000);
    
}


module.exports ={
    startLoopCheckingMod
}