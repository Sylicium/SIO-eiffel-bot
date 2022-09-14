module.exports = {
    parameters: [
        { name: "description", required: false, type: "string" }
    ],
    func: (Client, Modules_, req, res) => {
        let embed = new Modules_.Discord.EmbedBuilder()
            .setTitle("Démarrage du serveur")
            .setColor(0x00ff00)
            .setDescription(`${req.query.description || "Démarrage."}`)
            .setTimestamp()
        Client.channels.cache.get("846115466018816040").send({
            embeds: [embed]
        }).then(msg => {
            res.send({
                status: 200
            })
        }).catch(e => {
            res.send({
                status: 500,
                error: `${e}`,
                stack: e.stack.split("\n")
            })
        })
    } // end func
}