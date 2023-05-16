

const Discord = require("discord.js")
const logger = require("../../localModules/logger")
let config = require("../../config")
let somef = require("../../localModules/someFunctions")
const botf = require("../botLocalModules/botFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "roleselector",
            description: "Envoie le message du bot pour choisir son role",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: ["MANAGE_GUILD","ADMINISTRATOR"]
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {


        let buttonID_help_button = `roleselector__help_button_fcfafdd400f799f5`
        let buttonID_role_select = `roleselector__roleselect_fcfafdd400f799f5`

        const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.SelectMenuBuilder()
                .setCustomId(buttonID_role_select)
                .setPlaceholder("Selectionne ta classe")
                .setMinValues(0)
                .setMaxValues(25)
                .addOptions([
                    {
                        label: '=== Void ===',
                        description: 'Selection vide',
                        value: 'void',
                    },
                    {
                        label: 'SIO1A',
                        description: 'SIO en première année, classe A',
                        value: 'sio1a',
                    },
                    {
                        label: 'SIO1B',
                        description: 'SIO en première année, classe B',
                        value: 'sio1b',
                    },
                    {
                        label: 'SIO2A',
                        description: 'SIO en seconde année, classe A',
                        value: 'sio2a',
                    },
                    {
                        label: 'SIO2B',
                        description: 'SIO en seconde année, classe B',
                        value: 'sio2b',
                    },
                    {
                        label: 'Ancien',
                        description: 'Si tu est un ancien élève du lycée',
                        value: 'ancien',
                    },
                ]),
        );

        
        const row2 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(buttonID_help_button)
                .setLabel("Aide")
                .setStyle(Discord.ButtonStyle.Primary)
        );
        

        await interaction.channel.send({
            content: `Selectionnez votre classe après avoir lu les règles.\nSi vous vous êtes trompé de classe, cliquez sur le bouton **Aide**.\nObtenir un role signifie que vous acceptez le règlement.`,
            components: [row,row2]
        });
        await interaction.reply({
            content: `Message envoyé.`,
            ephemeral: true
        })

        
        const filter = i => ( (i.customId == buttonID_help_button) || (i.customId == buttonID_role_select) );
        const collector = interaction.channel.createMessageComponentCollector({ filter, });

        collector.on("collect", async i => {
            if((i.message.createdTimestamp + 1000*60) < (Date.now())) return i.reply({
                content: "Cette interaction a expirée.",
                ephemeral: true
            })

        })

    }
}
