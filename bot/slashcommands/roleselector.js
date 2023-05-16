

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


        let getOptionsPayload_pre1 = []

        for(let key in config.static.roleSelector) {
            getOptionsPayload_pre1.push({ name: key, id: config.static.roleSelector[key] })
        }


        function *getNextEmoji() {
            let list = [
                `0️⃣`,`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`,`🔟`
            ]
            for(let i in list) {
                yield list[i]
            }
        }
        let nextEmj = getNextEmoji()

        let getOptionsPayload = getOptionsPayload_pre1.map(x => {
            return {
                label: x.name,
                //description: x.name,
                value: x.id,
                emoji: nextEmj.next().value,
            }
        })

        logger.debug("getOptionsPayload:",getOptionsPayload)


        let buttonID_help_button = `roleselector__help_button_fcfafdd400f799f5`
        let buttonID_role_select = `roleselector__roleselect_fcfafdd400f799f5`
        let buttonID_reglement_button = `roleselector__reglement_fcfafdd400f799f5`

        const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId(buttonID_role_select)
                .setPlaceholder("Selectionne tes roles")
                .setMinValues(0)
                .setMaxValues( (getOptionsPayload.length > 25 ? 25 : getOptionsPayload.length) )
                .addOptions(getOptionsPayload),
        )

        /*
        const row2 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(buttonID_help_button)
                .setLabel("Aide")
                .setStyle(Discord.ButtonStyle.Primary)
        );*/


        const row2 = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(buttonID_reglement_button)
                .setLabel("Accepter le règlement")
                .setStyle(Discord.ButtonStyle.Success)
                .setEmoji(`📜`)
        );
        

        await interaction.channel.send({
            content: `Selectionnez votre classe après avoir lu les règles.\nSi vous vous êtes trompé de classe, cliquez sur le bouton **Aide**.\nObtenir un role signifie que vous acceptez le règlement.`,
            components: [row,row2]
        });

        
    }
}
