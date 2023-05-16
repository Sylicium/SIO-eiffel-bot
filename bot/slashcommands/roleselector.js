

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
            content: "",
            embeds:  [
                {
                  "id": 477778554,
                  "color": 15290191,
                  "fields": [
                        {
                            "id": 891451025,
                            "name": "🔹 Règle n°1",
                            "value": "Pas d'insultes, de racisme, d'homophobie ou de sexisme et réglez les disputes en privé !"
                        },
                        {
                            "id": 13111183,
                            "name": "🔹 Règle n°2",
                            "value": "Pas de pub (serveur ou autres) sauf ceux autorisés ET dans les channels fait pour."
                        },
                        {
                            "id": 982368710,
                            "name": "🔹 Règle n°3",
                            "value": "Respectez les chan et leurs utilité nous n'hésiterons pas a supprimer un post si celui ci n'a rien a faire sur un channel adapté."
                        },
                        {
                            "id": 595584449,
                            "name": "🔹 Règle n°4",
                            "value": "Ne volez pas d'œuvres d'art et ne les revendiquez pas comme les vôtres (y compris les émotes). Les œuvres d'art volées sont faciles à trouver et toute infraction sera prise très au sérieux !"
                        },
                        {
                            "id": 680879892,
                            "name": "🔹 Règle n°5",
                            "value": "Veuillez vous abstenir de parler de religion et de politique."
                        },
                        {
                            "id": 314354559,
                            "name": "🔹 Règle n°6",
                            "value": "Soyez prudent lorsque vous publiez des informations réelles et ne révélez jamais d'informations privées sur quelqu'un d'autre ! (ceci sera sévèrement punis et ce sera le ban définitif)"
                        },
                        {
                            "id": 350387756,
                            "name": "🔹 Règle n°7",
                            "value": "Pas de pings intempestifs."
                        },
                        {
                            "id": 195391012,
                            "name": "🔹 Règle n°8",
                            "value": "Veuillez éviter de me dm moi ou les modérateurs si vous n'avez pas de questions par rapport au dessin ou aux commissions."
                        },
                        {
                            "id": 304322515,
                            "name": "🔹 Règle n°9",
                            "value": "Si les règles ne sont pas respectés, des avertissements seront donnés et a partir de 3 le ban définitif tombera."
                        }
                    ]
                }
            ],
            components: [row,row2],
            files: [{
                attachment: './assets/Proto1_rules.png',
                name: 'reglement.png'
              }]
        });

        await interaction.reply({ content:"Message envoyé!", ephemeral: true })

    }
}
