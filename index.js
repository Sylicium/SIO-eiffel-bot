
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


let GlobalTemp = {
    cooldowns: {
        buttons: {

        }
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
        status: "online",
        activities: [{
            name: 'v3.0.0',
            type: "LISTENING",
        }]
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
            Logger.info(`??? Successfully loaded command ${temp.commandInformations.commandDatas.name}`)
        } catch(e) {
            Logger.warn(`??? Failed loading command of file /slashcommands/${file}`,e)
        }
    }
});

bot.on("ready", () => {
    Logger.info(`[BOT]: Bot d??marr?? en tant que ${bot.user.tag}`)
    //console.log(`Bot d??marr?? en tant que ${bot.user.tag} | ${Object.size(bot.guilds.cache)} serveurs rejoints`)

    bot.user.setPresence({
        status: "online",
        activities: [
            {
                name: `v${config.bot.version}`,
                type: "PLAYING"
            }
        ]
    });


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
                    msg.react("????")
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
            Logger.warn("??? Penser ?? d??sactiver le config.bot.setApplicationCommandsOnStart pour ne pas recharger les commandes ?? chaque d??marrage.")
            let commandDatas_ = SlashCommandsCollection.map(x => { return x.commandInformations.commandDatas })
            if(config.bot.setApplicationCommandsInLocal) {
                for(let i in config.bot.setApplicationCommandsInLocal_guilds) {
                    let guild = bot.guilds.cache.get(config.bot.setApplicationCommandsInLocal_guilds[i])
                    try {
                        guild.commands.set(commandDatas_)
                        Logger.info(`??? Successfully reloaded guild commands for ${guild.name} (${guild.id})`)
                    } catch(e) {
                        try {
                            Logger.warn(`??? Failed to reload guild commands for ${guild.name} (${guild.id})`,e)
                        } catch(err) {
                            Logger.warn(`?????? Failed to reload guild commands for UNKNOW guild (id=${config.bot.setApplicationCommandsInLocal_guilds[i]})`)
                            Logger.warn(e)
                        }
                    }
                }
            } else {
                try {
                    bot.application.commands.set(commandDatas_)
                    Logger.info(`??? Successfully reloaded global application commands.`)
                } catch(e) {
                    Logger.warn(`??? Failed to reload global application commands.`,e)
                }
            }
        }
        Logger.info("??? Chargement des slash commandes termin??")

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
                new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setTitle(`???? Aie.. Le bot manque de permissions!`)
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
            content: `??? Halte! Tu n'a pas la permission d'utiliser cette commande.\nIl te manque une de ces permissions: ${cmd.require.commandInformations.permisionsNeeded.user.map((x) => {
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
            content: `??? Commande SUPER_ADMIN uniquement.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.disabled && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `??? Commande d??sactiv??e.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.indev && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `???? Commande en d??veloppement`,
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

    if(interaction.customId == "roleselector__help_button_fcfafdd400f799f5") {
        let timeToWait = 1000*60*15
        if(GlobalTemp.cooldowns.buttons["roleselector__help_button_fcfafdd400f799f5"]) {
            if(GlobalTemp.cooldowns.buttons["roleselector__help_button_fcfafdd400f799f5"]+timeToWait > Date.now()) {
                await interaction.reply({
                    content: `Vous avez d??j?? utilis?? ce bouton, patientez encore <t:${Math.floor((GlobalTemp.cooldowns.buttons["roleselector__help_button_fcfafdd400f799f5"]+timeToWait)/1000)}:R>`,
                    ephemeral: true
                })
                return;
            }
        }
        GlobalTemp.cooldowns.buttons["roleselector__help_button_fcfafdd400f799f5"] = Date.now()
        interaction.deferUpdate()
        let chan = bot.channels.cache.get(config.static.channels.general)
        chan.send({
            content: `<@${interaction.user.id}> Votre demande d'aide a ??t?? cr????e.\n<@&${config.static.roles.miniboss}>`,
            embeds: [
                (
                    new Discord.EmbedBuilder()
                        .setTitle(`${interaction.user.tag} a un probl??me avec ses roles !`)
                        .setColor("ffa500")
                        .setAuthor({ name: `${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL()})
                        .setDescription(`Demande d'aide effectu??e le <t:${Math.floor(Date.now()/1000)}> \`\`\`Veuillez expliquer clairement votre probl??me dans ce channel.\`\`\` `)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter({ text: `ID: ${interaction.user.id}`})
                        .setTimestamp()
                )
            ]
        })
    }


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


bot.on("guildMemberAdd", async (member) => {
    try {
        //Logger.debug("member",member)
        // let chan = bot.channels.cache.get(config.static.channels.general)
        // if(member.guild.id != chan.guild.id) return;

        // chan.send({
        //     content: `Bienvenue <@${member.id}>`,
        //     embeds: [
        //         (new Discord.EmbedBuilder()
        //         .setDescription([`N???h??site pas ?? la aller voir les r??gles dans [#glados-rules](<#404573626134822912>) ???? !`,
        //             ``,
        //             `Aaah oui, renomme toi en **NOM + Pr??nom** et dis moi ta classe pour que t???attribue le r??le.`,
        //             ``,
        //             `Merci ! ????`,
        //             `_(ah et va bien lire les r??gles.. cl??ment guette..)_`,
        //         ].join("\n"))
        //         .setColor(`${somef.genHex(6)}`)
        //         .setImage("https://media.discordapp.net/attachments/403472421136367618/1019687572458446958/IMG_0627.jpg")
                
        //         )
                
        //     ]
        // })
        try {
            member.roles.add(config.static.roles.captcha_locked).catch(e => { Logger.warn(e) })
        } catch(e) {
            Logger.warn(e)
        }

        let verif_chan = await member.guild.channels.create({
            name: `captcha-${member.user.username.substr(0,10)}-${member.user.discriminator}`,
            type: Discord.ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: member.guild.id,
                    deny: [Discord.PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: member.id,
                    allow: [
                        Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages
                    ],
                },
                {
                    id: bot.user.id,
                    allow: [
                        Discord.PermissionsBitField.Flags.ViewChannel,
                        Discord.PermissionsBitField.Flags.SendMessages,
                        Discord.PermissionsBitField.Flags.ManageMessages,
                        Discord.PermissionsBitField.Flags.EmbedLinks,
                        Discord.PermissionsBitField.Flags.AttachFiles,
                        Discord.PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: config.static.roles.miniboss,
                    allow: [
                        Discord.PermissionsBitField.Flags.ViewChannel,
                        Discord.PermissionsBitField.Flags.SendMessages,
                        Discord.PermissionsBitField.Flags.ManageMessages,
                        Discord.PermissionsBitField.Flags.EmbedLinks,
                        Discord.PermissionsBitField.Flags.AttachFiles,
                        Discord.PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
            ],
        });

        let captcha = await botf.generateCaptcha()

        let captcha_time = 60*1000 // en milliseconde

        verif_chan.send({
            content: `<@${member.id}> Merci de compl??ter ce captcha en envoyant un message ici de ce que vous lisez.\nLe code est constitu?? de 6 caract??res lettre minuscule/majuscule et chiffre.\nLe captcha prendra fin <t:${Math.floor((Date.now()+captcha_time)/1000)}:R>`,
            files: [
                captcha.attachment
            ]
        }).then(async captcha_msg => {

            const filter = m => { return (m.author.id == member.id) };
            const collector = await verif_chan.createMessageCollector({ filter, time: captcha_time, max:1 });
    
            let answered = false
    
            collector.on('collect', m => {
                //logger.debug("collect collector",m)
                answered = true
                m.delete().catch(e => {
                    logger.warn(`Can't delete captcha response message: ${e}`)
                })
    
                if(m.content == captcha.text) {
                    captcha_msg.edit({ content: `<@${m.author.id}> ??? Captcha correct.`, files:[]})
                    member.roles.remove(config.static.roles.captcha_locked)

                } else {
                    captcha_msg.edit({ content: `<@${m.author.id}> ??? R??ponse erron??e au captcha.`, files:[]})
                    setTimeout(() => {
                        member.kick(`AutoAction | Failed captcha.`)
                    }, 12*1000)
                }
    
            })
    
    
            collector.on("end", collected  => {
                //logger.debug("ended collector",collected)
                setTimeout(() => {
                    if(!answered) {
                        captcha_msg.edit({ content: `<@${member.id}> ??? Vous avez mis trop de temps ?? faire le captcha.`, files:[]})
                        setTimeout(() => {
                            member.kick(`AutoAction | Too much time to perfom captcha.`)
                        }, 12*1000)
                    }
                }, 200)
                setTimeout(() => {
                    try {
                        verif_chan.delete().catch(e => { Logger.warn(e) })
                    } catch(e) { Logger.warn(e) }
                }, 10*1000)
            })

        }).catch(e => {
            logger.warn(`${e}`)
            logger.warn(e)
        })
        




    } catch(e) {
        Logger.warn(`${e}`)
        Logger.warn(e)
    }
})



bot.on("messageCreate", message => {
    if(message.content.indexOf(bot.user.id) != -1) message.reply("coucou de l'instance 2 (en local chez <@770334301609787392>)")
})


bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;
    Logger.log("select interaction:",interaction)

    if(interaction.customId == "roleselector__roleselect_fcfafdd400f799f5") {
        
        if(!interaction.member.nickname) {
            
		    const temp_modal = new Discord.ModalBuilder()
                .setCustomId('modal_change_nickname')
                .setTitle('Se renommer en NOM pr??nom');

            const temp_modal_1 = new Discord.TextInputBuilder()
                .setCustomId('lastname')
                .setLabel("Nom de famille")
                .setStyle(Discord.TextInputStyle.Short);

            const temp_modal_2 = new Discord.TextInputBuilder()
                .setCustomId('firstname')
                .setLabel("Pr??nom")
                .setStyle(Discord.TextInputStyle.Short);

            const temp_actionrow1 = new Discord.ActionRowBuilder().addComponents(temp_modal_1);
            const temp_actionrow2 = new Discord.ActionRowBuilder().addComponents(temp_modal_2);

            temp_modal.addComponents(temp_actionrow1, temp_actionrow2);
            interaction.showModal(temp_modal);
            return;
        }

        //interaction.deferUpdate()
        if(interaction.values.length == 0) return await interaction.reply({
            content: `Hmm, une erreur inconnue est survenue, merci de r??essayer. (E#01)`,
            ephemeral: true
        })
        let val = interaction.values[0]

        if(val == "void") { return interaction.deferUpdate() }


        let alreadyHasArole = interaction.member.roles.cache.map(x => x).filter((r) => { return (
            (r.id == config.static.roles.sio1a)
            || (r.id == config.static.roles.sio1b)
            || (r.id == config.static.roles.sio2a)
            || (r.id == config.static.roles.sio2b)
            || (r.id == config.static.roles.ancien)
        ) } )
        //Logger.debug("alreadyHasArole",alreadyHasArole)

        if(alreadyHasArole.length > 0) {
            await interaction.reply({
                content: `Vous poss??dez d??j?? un r??le pour une classe. Si vous avez fait une erreur, cliquez sur le bouton **Aide** pour demander de l'aide.`,
                ephemeral: true,
            })
            return;
        }

        function addEleveRole() {
            interaction.member.roles.add(config.static.roles.eleves).catch(e => {
                Logger.warn(e)
            })
        }

        if(val == "sio1a") {
            addEleveRole()
            interaction.member.roles.add(config.static.roles.sio1a).then(() => {
                interaction.reply({ content: `??? Le r??le sio1a vous a ??t?? attribu?? !`, ephemeral: true })
            }).catch(e => {
                Logger.warn(e)
                interaction.reply({ content: `??? Une erreur est survenue ?? l'ajout du role sio1a: **${e}** \`\`\`js\n${e.stack}\`\`\` `, ephemeral: true })
            })
        }
        else if(val == "sio1b") {
            addEleveRole()
            interaction.member.roles.add(config.static.roles.sio1b).then(() => {
                interaction.reply({ content: `??? Le r??le sio1b vous a ??t?? attribu?? !`, ephemeral: true })
            }).catch(e => {
                Logger.warn(e)
                interaction.reply({ content: `??? Une erreur est survenue ?? l'ajout du role sio1b: **${e}** \`\`\`js\n${e.stack}\`\`\` `, ephemeral: true })
            })
        }
        else if(val == "sio2a") {
            addEleveRole()
            interaction.member.roles.add(config.static.roles.sio2a).then(() => {
                interaction.reply({ content: `??? Le r??le sio2a vous a ??t?? attribu?? !`, ephemeral: true })
            }).catch(e => {
                Logger.warn(e)
                interaction.reply({ content: `??? Une erreur est survenue ?? l'ajout du role sio2a: **${e}** \`\`\`js\n${e.stack}\`\`\` `, ephemeral: true })
            })
        }
        else if(val == "sio2b") {
            addEleveRole()
            interaction.member.roles.add(config.static.roles.sio2b).then(() => {
                interaction.reply({ content: `??? Le r??le sio2b vous a ??t?? attribu?? !`, ephemeral: true })
            }).catch(e => {
                Logger.warn(e)
                interaction.reply({ content: `??? Une erreur est survenue ?? l'ajout du role sio2b: **${e}** \`\`\`js\n${e.stack}\`\`\` `, ephemeral: true })
            })
        }
        else if(val == "ancien") {
            addEleveRole()
            interaction.member.roles.add(config.static.roles.ancien).then(() => {
                interaction.reply({ content: `??? Le r??le ancien vous a ??t?? attribu?? !`, ephemeral: true })
            }).catch(e => {
                Logger.warn(e)
                interaction.reply({ content: `??? Une erreur est survenue ?? l'ajout du role ancien: **${e}** \`\`\`js\n${e.stack}\`\`\` `, ephemeral: true })
            })
        }
        else {
            await interaction.reply({
                content: `Hmm, une erreur inconnue est survenue, merci de r??essayer. (E#02)`,
                ephemeral: true
            })
        }
        

    }
    
	console.log(interaction);
});



bot.on("interactionCreate", interaction => {
	if (!interaction.isModalSubmit()) return;
    //Logger.debug("modalsubmit:",interaction)

    if(interaction.customId == "modal_change_nickname") {
        let lastname = (interaction.fields.getTextInputValue("lastname") || null)
        let firstname = (interaction.fields.getTextInputValue("firstname") || null)
        if(!lastname || !firstname) {
            interaction.reply({
                content: `Une erreur s'est produite, veuillez r??essayer.`,
                ephemeral: true
            })
            return;
        }
        let new_nickname = `${lastname.toUpperCase()} ${firstname.toLowerCase().capitalize()}`
        interaction.member.setNickname(new_nickname)
        interaction.reply({
            content: `Vous avez ??t?? renomm?? en \`${new_nickname}\`\n\n:warning: Pour bien re-selectionner votre classe selectionnez **=== Void ===** puis selectionnez ?? nouveau votre classe`,
            ephemeral: true
        })
    }
})


bot.login(config.bot.token)

