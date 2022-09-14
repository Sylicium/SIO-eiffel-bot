
const axios = require("axios")
const fs = require("fs")
let config = require("./config")

const express = require('express');
const Discord = require("discord.js");
const app = express();
app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);

const Modules_ = {
    "Discord": Discord,
    "app": app, 
    "config": config,
    "axios": axios
}


/*
param types:
string - pour du texte
object - dictionnaire { }
array - liste []
number - Nombre entier ou flotant
boolean - true/false

*/

let APIEvents = [
]

console.log(`[API] Loading APIEvents...`)
fs.readdirSync("./api/").forEach(directoryName => {
    let dirPath = `./api/${directoryName}`
    try {
        if( fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory() ) {
            console.log(`[API]   Loading api endpoints for method ${directoryName.toUpperCase()}`)
            fs.readdirSync(`./api/${directoryName}/`).forEach(file => {
                let the_require = require(`./api/${directoryName}/${file}`)
                the_require.method = directoryName.toUpperCase()
                let fileName = file.split(".")
                fileName.pop()
                fileName = fileName.join(".")
                the_require.endpoint = fileName
                APIEvents.push(the_require)
                console.log(`[API]     ✔ Loaded API endpoint (${the_require.method}) /${the_require.endpoint}`)
            })
        } else {
            console.log(`[API]   ! ${directoryName} is a file, not a directory`)
        }
    } catch(e) {
        console.log(`[API][ERROR] ❌`,e)
    }

})
console.log(`[API] ✅ Loaded ${APIEvents.length} APIEvents`,APIEvents)

let Client;

module.exports.run = (instance_client) => {
    Client = instance_client

    app.all("*", (req, res) => {

        if(req.path == "/") {
            return res.sendFile(`${__dirname}/site/index.html`)
        } else if(req.path.startsWith("/api/")) {
            
            let endpoint = req.path.substr(5, req.path.length)


            let apiEvent_list = APIEvents.filter((item) => {
                return (endpoint == item.endpoint)
            })
            
            if(apiEvent_list.length == 0) return res.send({
                status: 404,
                message: `Cet endpoint n'existe pas` 
            })

            apiEvent_list2 = apiEvent_list.filter((item) => {
                return (item.method == req.method)
            })
            let allMethodsAllowed = apiEvent_list.map((item, index) => {
                return item.method
            })

            if(apiEvent_list2.length == 0) return res.send({
                status: 405,
                message: `Method not allowed`,
                methods: allMethodsAllowed
            })

            let apiEvent = apiEvent_list2[0]

            for(let paramName in req.query) {
                let paramValue = req.query[paramName]
                try {
                    req.query[paramName] = JSON.parse(paramValue)
                } catch(e) {
                    Logger.error(e)
                    return res.send({
                        status: 500,
                        message: `Internal server error while parsing to JSON query parameter '${paramName}'.`,
                        error: `${e}`,
                        stack: e.stack.split("\n")
                    })
                }
            }
    
            for(let i in apiEvent.parameters) {
                let param = apiEvent.parameters[i]
                if(!req.query[param.name] && param.required) {
                    return res.send({
                        status: 400,
                        message: `Bad request. Paramètres manquants: '${param.name}'. ${param.msg || ""}`,
                        parameters: apiEvent.parameters
                    })
                } else if(req.query[param.name]) {
                    try {
                        if(param.type == "array") {
                            if(!Array.isArray(req.query[param.name])) {
                                return res.send({
                                    status: 400,
                                    message: `Bad request. Type de paramètre invalide: '${param.name}'. ${param.msg || ""}`,
                                    parameters: apiEvent.parameters
                                })
                            }
                        } else if(typeof req.query[param.name] != param.type) {
                            return res.send({
                                status: 400,
                                message: `Bad request. Type de paramètre invalide: '${param.name}'. ${param.msg || ""}`,
                                parameters: apiEvent.parameters
                            })
                        }
                    } catch(e) {
                        Logger.error(e)
                        return res.send({
                            status: 500,
                            message: `Internal server error while parsing query parameter '${param.name}' (type:${param.type} | required:${param.required}).`,
                            error: `${e}`,
                            stack: e.stack.split("\n")
                        })
                    }
                }
            }

            apiEvent.func(Client, Modules_, req, res)
            
            return;

        } else {
            return res.sendFile(`${__dirname}/site/404.html`)
        }

    })


    serv.listen(config.website.port, () => {
        console.log(`Serveur démarré sur le port ${config.website.port}`)
    })

}