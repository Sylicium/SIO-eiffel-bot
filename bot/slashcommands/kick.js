

const Discord = require("discord.js")
const logger = require("../../localModules/logger")
let config = require("../../config")
let somef = require("../../localModules/someFunctions")
const botf = require("../botLocalModules/botFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "kick",
            description: "Kick un membre du serveur.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "member",
                    "description": "Le membre à expulser",
                    "type": Discord.ApplicationCommandOptionType.User,
                    "required": true
                },
                {
                    "name": "reason",
                    "description": "Raison du kick",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false
                }
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL","KICK_MEMBERS"],
            user: ["KICK_MEMBERS"]
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

        console.log("membre:",membre)

        if(!membre) return interaction.reply({
            content: `❌ Mince, une erreur attendue est survenue: Le membre mentionné est invalide (il a probablement quitté le serveur).`,
            ephemeral: true
        })

        if(membre.user.id == interaction.user.id) return interaction.reply({
            content: `lol il veut s'auto kick..`
        })

        if(membre.user.id == (await interaction.guild.fetchOwner()).user.id) return interaction.reply({
            content: `❌ Vous ne pouvez pas expulser l'owner du serveur.`,
            ephemeral: true
        })

        if(membre.user.id == bot.user.id) return interaction.reply("Il veut kick le bot.. tu veux kick le bot genre ?\nBa non t'es con")

        let userRole = membre.roles.highest; // get the member's highest role
        let botRole = interaction.guild.me_().roles.highest
 
        // if the member's highest role is lower than the specified role, kick them
        if (botRole.comparePositionTo(userRole) > 0) { } else {
            return interaction.reply({
                content: `❌ Mince, il semble que ce membre possède un role au même niveau ou au dessus du bot, impossible de l'expulser.`,
                ephemeral: true
            })
        }

        if(!membre.kickable) return interaction.reply({
            content: `❌ Mince, impossible d'expulser ce membre pour une raison inconnue (Vérifiez les permissions du bot et de l'utilisateur à expulser).`,
            ephemeral: true
        })

        membre.kick(`${interaction.user.tag} | ${reason}`).then(() => {
            interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("FFFFFF")
                        .setTitle(`✅ Le membre **(${membre.user.tag})** a été expulsé`)
                        .setDescription(`Raison: \`${reason}\`\n\nMembre: <@${membre.id}> ${membre.user.tag} (\`${membre.id}\`)`)
                        .setFooter({ text: `Expulsé par ${interaction.user.tag}` })
                        .setTimestamp()
                ]
            })
        }).catch(err => {
            interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("FF0000")
                        .setTitle(`🤖 Aie... je n'ai pas pu expulser ce membre`)
                        .setDescription(`**${err}** \`\`\`js\n${err}\`\`\` `)
                ],
                ephemeral: false
            })
        })

    }
}
