

const Discord = require("discord.js")
const logger = require("../../localModules/logger")
let config = require("../../config")
let somef = require("../../localModules/someFunctions")
const botf = require("../botLocalModules/botFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "crous",
            description: "Renvoie le menu du crous",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()

        let menus_crous = await somef.getMenusCrous()

        let pageManager = new botf.pageManager(menus_crous, 1)


        let buttonID_before = `search_previous_${Modules.somef.genHex(32)}`
        let buttonID_after = `search_next_${Modules.somef.genHex(32)}`
    
        let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                .setCustomId(buttonID_before)
                .setLabel("◀")
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(true)
            )
            .addComponents(
                new Discord.ButtonBuilder()
                .setCustomId(buttonID_after)
                .setLabel("▶")
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled( (pageManager.getInfos().pageCount == 1) )
            );

        
        function getMenuComponents(menuComponents) {
            let text = []
            for(let i in menuComponents) {
                text.push(`**${i}**`)
                for(let i2 in menuComponents[i]) {
                    text.push(` - ${menuComponents[i][i2]}`)
                }
            }
            return text.join("\n")
        }

        function getMenuEmbed(menuFullObject) {
            logger.log("menuFullObject",menuFullObject)
            pInfos = pageManager.getInfos()
            return (
                new Discord.EmbedBuilder()
                    .setTitle("----------")
                    .setColor("FFFFFF")
                    .setAuthor({ name: `${menuFullObject.title}` })
                    .setDescription(`${getMenuComponents(menuFullObject.menu)}`)
                    .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • thx to zergoud#0239` })
            )
        }

        try {
            pageManager.selectPage(0)
            await interaction.editReply({
                embeds: [
                    getMenuEmbed(pageManager.getSelectedPage()[0])
                ],
                components: [row]
            }).catch(e => {
                console.log(e)
            })
        } catch(e) {
            console.log(e)
        }

        
        const filter = i => ( (i.customId == buttonID_before) || i.customId == buttonID_after) && (i.isButton());
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5*60*1000 });

        collector.on("collect", async i => {
            if((i.message.createdTimestamp + 1000*60) < (Date.now())) return i.reply({
                content: "Cette interaction a expirée.",
                ephemeral: true
            })
            if( interaction.user.id != i.user.id ) return i.reply({
                content: "Cette interaction ne vous est pas destinée.",
                ephemeral: true
            })


            i.deferUpdate()


            /*
            let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("⬅")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("➡")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setDisabled(true)
            );
            */

            function getNewRows(options={
                before: false,
                after: false,
                website: false
            }) {
                let row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId(buttonID_before)
                        .setLabel("◀")
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled( ( ((options.before == true) || (options.before == false)) ? options.before : false ) )
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId(buttonID_after)
                        .setLabel("▶")
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled( ( ((options.after == true) || (options.after == false)) ? options.after : false ) )
                    )
                return row
            }
            
            if(i.customId == buttonID_before) {
                let switched = pageManager.switchPage(-1)
                pInfos = pageManager.getInfos()
                await interaction.editReply({
                    embeds: [
                        getMenuEmbed(pageManager.getSelectedPage()[0])
                    ],
                    components: [getNewRows({ before: switched.edge })]
                })
            } else if(i.customId == buttonID_after) {
                let switched = pageManager.switchPage(1)
                pInfos = pageManager.getInfos()
                await interaction.editReply({
                    embeds: [
                        getMenuEmbed(pageManager.getSelectedPage()[0])
                    ],
                    components: [getNewRows({ after: switched.edge })]
                })
            }

        })


    }
}
