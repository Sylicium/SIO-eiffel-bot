
try {
    require("dotenv").config()
} catch(e) {}

let indev = false

module.exports = {
    website: {
        port: 3333
    },
    bot: {
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
            birthday: "908349988235530240" //"403472421136367618"
        },
        roles: {
            sio1a: "", //"405059851253841930",
            sio1b: "", //"405060033790083082",
            sio2a: "", //"405060752601251851",
            sio2b: "1020097535047639110", //"405060115654508557",
            ancien: "",
            captcha_locked: "1020021259247030353",
            miniboss: "906676964272775188",
        }
    } : {
        channels: {
            general: "403472421136367618",
            birthday: "403472421136367618",
        },
        roles: {
            sio1a: "405059851253841930",
            sio1b: "405060033790083082",
            sio2a: "405060752601251851",
            sio2b: "405060115654508557",
            ancien: "405060215667687427",
            captcha_locked: "1020102220995383326",
            miniboss: "404230377767567360",
        }
    }) 
}