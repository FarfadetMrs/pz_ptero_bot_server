const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const { getPlayersOnline } = require('../pterodactyl_pz_server.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whoisonline')
		.setDescription('Commande pour savoir qui est en ligne'),
	async execute(interaction) {
        getPlayersOnline(function (players_infos) {
            const exampleEmbed = new EmbedBuilder()
                .setColor(0x2EA1FB)
                .setTitle('Qui est en ligne en ce moment ?')
                .setDescription(`Il y a ${players_infos.count} joueurs connectés`)
                .addFields(
                    { name: 'Joueurs : ', value: players_infos.list.join(", ") },
                    { name: '\u200B', value: '\u200B' },
                )
                .setTimestamp()
           if (interaction) interaction.reply({ embeds: [exampleEmbed] });
            
        });
	},
};