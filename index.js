
const axios = require("axios")
const fs = require("fs")
let config = require("./config")
const Discord = require("discord.js")
const Logger = require("./localModules/logger")
const somef = require("./localModules/someFunctions")
const botf = require("./bot/botLocalModules/botFunctions")

let birthdays = {
    list: JSON.parse(fs.readFileSync("./datas/birthdays.json","utf-8")),
    wished: JSON.parse(fs.readFileSync("./datas/birthdays_wished.json","utf-8")),
    wishToId: (id) => {
        if(birthdays.wished[(new Date()).getFullYear()] == undefined) birthdays.wished[(new Date()).getFullYear()] = []
        birthdays.wished[(new Date()).getFullYear()].push(id)
        return fs.writeFileSync("./datas/birthdays_wished.json",JSON.stringify(birthdays.wished,null,4))
    }
}

try {
    require("dotenv").config()
} catch(e) {}

let bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.GuildBans,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.ThreadMember,
        Discord.Partials.User
    ],
    presence: {
      status: 'online',
      activity: {
        name: `la télé`,
        type: 'WATCHING'
      }
    }
})

botf._initBotFunctions(bot)
bot.botf = botf

let server = require("./server")
const logger = require("./localModules/logger")


const Modules = {
    somef: somef,
    botf: botf,
    server: server,
    Logger: Logger,
    fs: fs,
    axios: axios
}


bot.commands = {}
bot.commands.slashCommands = new Discord.Collection();

let SlashCommandsCollection = []

fs.readdirSync("./bot/slashcommands").forEach(file => {
    if(file.endsWith(".js")) {
        try {
            let fileName = file.split(".")
            fileName.pop()
            fileName.join(".")

            temp = require(`./bot/slashcommands/${fileName}`)
            SlashCommandsCollection.push({
                commandInformations: temp.commandInformations,
                require: temp
            });
            bot.commands.slashCommands.set(temp.commandInformations.commandDatas.name, {
                commandInformations: temp.commandInformations,
                require: temp
            });
            Logger.info(`✔ Successfully loaded command ${temp.commandInformations.commandDatas.name}`)
        } catch(e) {
            Logger.warn(`❌ Failed loading command of file /slashcommands/${file}`,e)
        }
    }
});

bot.on("ready", () => {
    Logger.info(`[BOT]: Bot démarré en tant que ${bot.user.tag}`)
    //console.log(`Bot démarré en tant que ${bot.user.tag} | ${Object.size(bot.guilds.cache)} serveurs rejoints`)


    let birthdayChannel = bot.channels.cache.get(config.static.channels.birthday)

    function isAlreadyWished(identityOrId) {
        if(birthdays.wished[(new Date()).getFullYear()] == undefined) birthdays.wished[(new Date()).getFullYear()] = []
        return birthdays.wished[(new Date()).getFullYear()].includes( (identityOrId.id || identityOrId) )
    }
    function isBirthday(identity) {
        let d = new Date()
        console.log("identity.birthday.day == d.getDate()", identity.birthday.day, d.getDate() )
        console.log("identity.birthday.month == d.getMonth()",identity.birthday.month, d.getMonth() )

        return (
            identity.birthday.day == d.getDate()
            && identity.birthday.month == (d.getMonth()+1)
        )
    }
    function getBirthdayString(identity) { return `${identity.birthday.day}/${identity.birthday.month}/${identity.birthday.year}` }
    function checkForBirthdays() {

        let birthdayListIdentity = []
        for(let i in birthdays.list) {
            let identity = birthdays.list[i]
            if(!isBirthday(identity)) {
                console.log(`Birthdays: Not for ${identity.last_name} ${identity.first_name} (${getBirthdayString(identity)})`)
                continue;
            }
            if(isAlreadyWished(identity)) {
                console.log(`Birthdays: Already wished for ${identity.last_name} ${identity.first_name} (${getBirthdayString(identity)})`)
                continue;
            }
            logger.log(`Birthdays: BON ANNIVERSSAIRE A ${identity.last_name} ${identity.first_name} (${getBirthdayString(identity)}) !!!!!!!!!!!!!!!`)
            birthdays.wishToId(identity.id)
            birthdayListIdentity.push(identity)
        }


        async function getDiscordAccounts(identityList) {
            let guild = bot.guilds.cache.get(birthdayChannel.guild.id)
            let members = guild.members.fetch()
            
            return identityList.map((i, index) => {
                return {
                    identity: i,
                    discord: guild.members.cache.find(m => { return (somef.compareString(`${m?.nickname || m?.user?.username || undefined}`.toLowerCase(), `${i.last_name} ${i.first_name}`.toLowerCase()) > 0.9) })
                }
            })
        }

        setTimeout(async () => {
            try {
                if(birthdayListIdentity.length == 0) return;
                let birthdayListDiscordAccounts = await getDiscordAccounts(birthdayListIdentity)
                birthdayChannel.send({
                    content: [
                        //`Aujourd'hui c'est l'anniversaire de: ${birthdayListIdentity.map((i) => { return `${i.last_name.toUpperCase()} ${i.first_name}` }).join(", ")}`,
                        //`${birthdayListDiscordAccounts.map((i) => { return `<@${i.discord.id}>` })}`,
                        `Aujourd'hui c'est l'anniversaire de:`,
                        `${birthdayListDiscordAccounts.map((i) => { return ` ${i.discord ? `<@${i.discord.id}>` : `**${i.identity.last_name.toUpperCase()} ${i.identity.first_name}** en ${i.identity.class} (pas sur le serveur mais souhaitez lui irl si vous le croisez !)`}` }).join("\n")}`
                    ].join("\n")
                }).then(msg => {
                    msg.react(":tada:")
                    msg.react("🥳")
                })
            } catch(e) {
                logger.warn(e)
            }
        }, 10)

    }

    setInterval(() => {
        checkForBirthdays()
    }, 11*60*60*1000 )
    checkForBirthdays()
    
    
    try {

        if(config.bot.setApplicationCommandsOnStart) {
            Logger.warn("❕ Penser à désactiver le config.bot.setApplicationCommandsOnStart pour ne pas recharger les commandes à chaque démarrage.")
            let commandDatas_ = SlashCommandsCollection.map(x => { return x.commandInformations.commandDatas })
            if(config.bot.setApplicationCommandsInLocal) {
                for(let i in config.bot.setApplicationCommandsInLocal_guilds) {
                    let guild = bot.guilds.cache.get(config.bot.setApplicationCommandsInLocal_guilds[i])
                    try {
                        guild.commands.set(commandDatas_)
                        Logger.info(`✔ Successfully reloaded guild commands for ${guild.name} (${guild.id})`)
                    } catch(e) {
                        try {
                            Logger.warn(`❌ Failed to reload guild commands for ${guild.name} (${guild.id})`,e)
                        } catch(err) {
                            Logger.warn(`❌❌ Failed to reload guild commands for UNKNOW guild (id=${config.bot.setApplicationCommandsInLocal_guilds[i]})`)
                            Logger.warn(e)
                        }
                    }
                }
            } else {
                try {
                    bot.application.commands.set(commandDatas_)
                    Logger.info(`✔ Successfully reloaded global application commands.`)
                } catch(e) {
                    Logger.warn(`❌ Failed to reload global application commands.`,e)
                }
            }
        }
        Logger.info("✅ Chargement des slash commandes terminé")

    } catch(e) {
        Logger.debug(e)
    }
})



bot.on("interactionCreate", async (interaction) => {

    if(!interaction.guild) return;
    if(interaction.user.bot) return;


    interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

    Logger.debug("interaction [command]",interaction)

    //let data = await Database.getGuildDatas(interaction.guild.id)
    let data = undefined

    Logger.debug("Got interaction: "+interaction)

    if(!interaction.isCommand()) return;

    console.log("interaction.command",interaction.command)

   



    let cmd = bot.commands.slashCommands.get(interaction.commandName)

    if(!cmd) {
        return interaction.reply({
            content: ":x: Commande inconnue. [code#01]",
            ephemeral: true
        })
    }

    let hasPerm_bot1 = botf.checkPermissionsInChannel(
        interaction.guild.me_(),
        [ "VIEW_CHANNEL", "SEND_MESSAGES" ].concat(cmd.require.commandInformations.permisionsNeeded.bot),
        interaction.channel,
        true
    )
    
    let hasPerm_bot2 = botf.checkPermissions(interaction.guild.me_(), cmd.require.commandInformations.permisionsNeeded.bot, true)
    let hasPerm_bot = {
        havePerm: hasPerm_bot1.havePerm && hasPerm_bot2.havePerm,
        missingPermissions: somef.removeDuplicates(hasPerm_bot1.missingPermissions.concat(hasPerm_bot2.missingPermissions))
    }

    //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.bot} : `,hasPerm_bot)
    let hasPerm_user = botf.checkPermissions(interaction.member, cmd.require.commandInformations.permisionsNeeded.user)
    //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.user} : `,hasPerm_user)

    if(!hasPerm_bot.havePerm) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("FF0000")
                    .setTitle(`🤖 Aie.. Le bot manque de permissions!`)
                    .setDescription(`Il a besoin des permissions suivantes:\n${hasPerm_bot.missingPermissions.map((x) => {
                        return `\`${x}\``
                    }).join(", ")}`)
                    .setFooter({ text: `Essayez de contacter un administrateur.` })
            ],
            ephemeral: false
        })
    }
    if(!hasPerm_user.havePerm && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Halte! Tu n'a pas la permission d'utiliser cette commande.\nIl te manque une de ces permissions: ${cmd.require.commandInformations.permisionsNeeded.user.map((x) => {
                return `\`${x}\``
            }).join(", ")}`,
            ephemeral: true
        })
    }

    /*
    let filtered = SlashCommandsCollection.filter(x => {
        return x.commandInformations.commandDatas.name == interaction.command.name
    })
    */

    

    if(cmd.require.commandInformations.superAdminOnly && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Commande SUPER_ADMIN uniquement.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.disabled && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Commande désactivée.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.indev && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `🛠 Commande en développement`,
            ephemeral: true
        }) 
    }


    if(!cmd || !cmd.require) {
        return interaction.reply({
            content: `:x: Commande non prise en charge.`,
            ephemeral: true
        })
    }

    
    cmd.require.execute(Modules, bot, interaction, data).catch(async err => {
        Logger.warn(`Command crashed`,err)
        let the_error_msg = {
            content: "",
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`:x: Woops, looks like the command crashed.`)
                    .setColor("FF0000")
                    .setDescription(`\`\`\`js\n${err.stack}\`\`\``)
            ]
        }
        try {
            await interaction.reply(the_error_msg)
        } catch(e) {
            try {
                await interaction.editReply(the_error_msg)
            } catch(err) {
                Logger.warn(err)
            }
        }
    })

})


bot.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;
    
    if(!interaction.guild) return;
    if(interaction.user.bot) return;

    interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

    Logger.debug("Got interaction button: "+interaction)

    //let data = await Database.getGuildDatas(interaction.guild.id)



    //console.log(interaction);
});

bot.on('messageCreate', async (message) => {

    if(!somef.isSuperAdmin(message.author.id)) return;

    if(message.content == "!testerror") {
        try {
            console.log(cc)
        } catch(err) {
            bot.botf.sendError(err)
        }
    }


});


bot.on("guildMemberAdd", (member) => {
    try {
        Logger.debug("member",member)
        let chan = bot.channels.cache.get(config.static.channels.general)
        if(member.guild.id != chan.guild.id) return;


        let verif_chan = bot.channels




        chan.send({
            content: `Bienvenue <@${member.id}>`,
            embeds: [
                (new Discord.EmbedBuilder()
                .setDescription([`N’hésite pas à la aller voir les règles dans [#glados-rules](<#404573626134822912>) 😄 !`,
                    ``,
                    `Aaah oui, renomme toi en **NOM + Prénom** et dis moi ta classe pour que t’attribue le rôle.`,
                    ``,
                    `Merci ! 😉`,
                    `_(ah et va bien lire les règles.. clément guette..)_`,
                ].join("\n"))
                .setColor(`${somef.genHex(6)}`)
                .setImage("https://media.discordapp.net/attachments/403472421136367618/1019687572458446958/IMG_0627.jpg")
                
                )
                
            ]
        })
    } catch(e) {
        Logger.warn(`${e}`)
        Logger.warn(e)
    }
})



bot.on("messageCreate", message => {
    if(message.content.indexOf(bot.user.id) != -1) message.reply("coucou de l'instance 2 (en local chez <@770334301609787392>)")
})




bot.login(config.bot.token)

