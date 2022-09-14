module.exports = {
    parameters: [
        { name: "description", required: false, type: "string", msg: "Message envoyé lorque ce paramètre est requis mais non fournis"}
    ],
    func: (Client, Modules_, req, res) => {
        let embed = new Modules_.Discord.EmbedBuilder()
            .setTitle("Extinction du serveur")
            .setColor(0xff0000)
            .setDescription(`${req.query.description || "Extinction."}`)
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