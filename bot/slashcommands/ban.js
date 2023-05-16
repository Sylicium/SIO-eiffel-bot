

const Discord = require("discord.js")
const logger = require("../../localModules/logger")
let config = require("../../config")
let somef = require("../../localModules/someFunctions")
const botf = require("../botLocalModules/botFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "ban",
            description: "Bannir un membre du serveur.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "member",
                    "description": "Le membre à bannir",
                    "type": Discord.ApplicationCommandOptionType.User,
                    "required": true
                },
                {
                    "name": "reason",
                    "description": "Raison du ban",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false
                },
                {
                    "name": "delete_messages",
                    "description": "Supprimer les messages",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false,
                    "choices": [
                        { name: 'Ne rien supprimer', value: "0" },
                        { name: '1 derniers jours', value: "1" },
                        { name: '2 derniers jours', value: "2" },
                        { name: '3 derniers jours', value: "3" },
                        { name: '4 derniers jours', value: "4" },
                        { name: '5 derniers jours', value: "5" },
                        { name: '6 derniers jours', value: "6" },
                        { name: '7 derniers jours', value: "7" },
                    ]
                }
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL","BAN_MEMBERS"],
            user: ["BAN_MEMBERS"]
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: true,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {


        let membre = interaction.options.getMember("member")
        let reason = (interaction.options.get("reason")?.value || "<Aucune raison fournie>")
        let delete_messages = ( interaction.options.get("delete_messages")?.value ? parseInt(interaction.options.get("delete_messages").value) : 0)

        logger.log("membre:",membre)

        logger.log("delete_messages:",delete_messages)


        if(!membre) return interaction.reply({
            content: `❌ Mince, une erreur attendue est survenue: Le membre mentionné est invalide (il a probablement quitté le serveur).`,
            ephemeral: true
        })

        if(membre.user.id == interaction.user.id) return interaction.reply({
            content: `lol il veut s'auto ban..`
        })

        if(membre.user.id == (await interaction.guild.fetchOwner()).user.id) return interaction.reply({
            content: `❌ Vous ne pouvez pas bannir l'owner du serveur.`,
            ephemeral: true
        })

        if(membre.user.id == bot.user.id) return interaction.reply("Il veut ban le bot.. tu veux ban le bot genre ?\nBa non t'es con")

        let userRole = membre.roles.highest; // get the member's highest role
        let botRole = interaction.guild.me_().roles.highest
 
        // if the member's highest role is lower than the specified role, ban them
        if (botRole.comparePositionTo(userRole) > 0) { } else {
            return interaction.reply({
                content: `❌ Mince, il semble que ce membre possède un role au même niveau ou au dessus du bot, impossible de le bannir.`,
                ephemeral: true
            })
        }

        if(!membre.bannable) return interaction.reply({
            content: `❌ Mince, impossible bannir ce membre pour une raison inconnue (Vérifiez les permissions du bot et de l'utilisateur à bannir).`,
            ephemeral: true
        })

        logger.log("{ deleteMessageDays: delete_messages, reason: `${interaction.user.tag} | ${reason}`}",{ deleteMessageDays: delete_messages, reason: `${interaction.user.tag} | ${reason}`})

        membre.ban({ deleteMessageDays: delete_messages, reason: `${interaction.user.tag} | ${reason}`}).then(() => {
            interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("FFFFFF")
                        .setTitle(`✅ Le membre **(${membre.user.tag})** a été banni`)
                        .setDescription(`Raison: \`${reason}\`\nSuppression des messages des **${delete_messages}** derniers jours.\n\nMembre: <@${membre.id}> ${membre.user.tag} (\`${membre.id}\`)`)
                        .setFooter({ text: `Banni par ${interaction.user.tag}` })
                        .setTimestamp()
                ]
            })
        }).catch(err => {
            interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("FF0000")
                        .setTitle(`🤖 Aie... je n'ai pas pu bannir ce membre`)
                        .setDescription(`**${err}** \`\`\`js\n${err}\`\`\` `)
                ],
                ephemeral: false
            })
        })

    }
}
