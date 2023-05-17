
try {
    require("dotenv").config()
} catch(e) {}

let indev = true

module.exports = {
    website: {
        port: 3333
    },
    bot: {
        version: "3.0.0",
        prefix: "!",
        id: "1014189091249733722",
        token: process.env["TOKEN"],
        setApplicationCommandsOnStart: false,
        setApplicationCommandsInLocal: true,
        setApplicationCommandsInLocal_guilds: [
            "792139282831507467", // test de bots
            "403472420712873985", // SIO eiffel
        ],
        inviteURL: "https://discord.com/oauth2/authorize?client_id=1014189091249733722&permissions=8&scope=bot%20applications.commands"
    },
    superadmin: {
        list: [
            "770334301609787392", // Sylicium#3980
            "680114872813748318", // Akiruna#2743
        ]
    },
    emojis: {
        "loading": {
            id: "867530470438731827",
            tag: "<a:loading:867530470438731827>"
        },
        "check_mark": {
            id: "905859187580485662",
            tag: "<:check:905859187580485662>"
        },
        "no": {
            id: "",
            tag: "❌"
        }
    },
    static: (indev ? {
        channels: {
            general: "908349988235530240", // "403472421136367618"
        },
        roles: {
            reglement: "1108101423201259640"
        },
        roleSelector: {
            sio2a: "1108077234306174986",
            sio2b: "1020097535047639110",
            sio2c: "1108077272805670983",
        }
    } : {
        channels: {
            general: "AAAAAAAAAAAAAAAAAAAAA",
        },
        roles: { },
        roleSelector: {

        }
    }) 
}