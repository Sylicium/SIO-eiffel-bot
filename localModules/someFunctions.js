
const axios = require("axios")
const fs = require("fs")
let config = require("../config")
const Discord = require("discord.js")
const puppeteer = require('puppeteer')
var DOMParser = require('dom-parser');


Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});


/**
 * f()
 */
module.exports.saveUncaughtError = saveUncaughtError
function saveUncaughtError(err, specialSuffix=undefined, additionnalInformations="No additional informations provided.") {
    if(specialSuffix == undefined) specialSuffix = "GEN"
    let UUID = `${genHex(8)}-${specialSuffix}`
    let datas = [
        `----------------------------------------`,
        `Error UUID is: ${UUID}`,
        `Error occured on ${(new Date()).toLocaleString("fr")} (${Date.now()})`,
        `Error: ${err}`,
        `----------------------------------------`,
        ``,
        `Stack: ${err.stack}`,
        ``,
        `----------------------------------------`,
        `Additionnal informations provided in the call of the saving function:`,
        `----------------------------------------`,
        ``,
        `${additionnalInformations}`,
        ``,
    ].join("\n")
    fs.writeFileSync(`./logs/uncaughtErrors/${UUID}.log`, datas)
    return {
        err: err,
        UUID: UUID,
    }
}


/**
 * f() : Booléen qui retourne true si l'ID est celui d'un SuperAdmin
 * @param {string} user_id - L'id de l'utilisateur a check
 */
module.exports.isSuperAdmin = isSuperAdmin
function isSuperAdmin(idOrUser) {
    if(config.superadmin.list.includes(idOrUser)) return true
    try {
        if(config.superadmin.list.includes(idOrUser.id)) return true
    } catch(e) {}
    return false
}

module.exports.shuffle = shuffle
/**
 * f() : Mélange aléatoirement la liste donnée.
 * @param {Array} list - La liste a mélanger
 */
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
}


module.exports.sum = sum
/**
 * f() : Retourne la somme de tous les éléments de la liste
 * @param {Array} list - La liste en entrée
 */
function sum(list) {
    return list.reduce((partialSum, a) => partialSum + a, 0);
}

module.exports.choice = choice
/**
 * f() : Retourne un élément àléatoire de la liste
 * @param {Array} list - La liste en entrée
 */
function choice(list) {
    return list[Math.floor(Math.random()*list.length)]
}


module.exports.genID = genID
/**
 * f() : Retourne une chaine de chiffre aléatoires de la longueur voulue
 * @param {Number} length - Longueur de la chaine voulue
 */
function genID(len) { return Array(len).fill(undefined).map((i) => { return Math.floor(Math.random()*10) }).join("")}


module.exports.genHex = genHex
/**
 * f() : Retourne une chaine héxadécimale de la longueur voulue
 * @param {Number} length - Longueur de la chaine voulue
 * @param {Boolean} capitalize - Mettre la chaine en caractères majuscule
 */
function genHex(length, capitalize=false) {
    let str = [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return (capitalize ? str.toUpperCase() : str.toLowerCase())
}

module.exports.any = any
/**
 * f() : Retourne true si au moins 1 élément se trouve dans les 2 listes
 * @param {Array} list - La 1ere liste
 * @param {Array} list_two - La 2ere liste
 * @param {Boolean} caseSensitive - Prendre en compte ou non la casse. Default: true
 */
function any(list, list_two, caseSensitive=true) {
    if(!caseSensitive) {
        list = list.map(f=>{ return f.toLowerCase(); });
        list_two = list_two.map(f=>{ return f.toLowerCase(); });
    }
    for(let i in list) {
        if(list_two.indexOf(list[i]) != -1) return true
    }
    return false
}

module.exports.all = all
/**
 * f() : Retourne true si tous les éléments de la liste A se trouvent dans la B
 * @param {Array} from_list - La liste qui doit être contenue intégralement dans la 2eme
 * @param {Array} list_in - La liste qui doit contenir chaque élement de la 1ere
 * @param {Boolean} caseSensitive - Prendre en compte ou non la casse. Default: true
 */
function all(from_list, list_in, caseSensitive=true) {
    if(!caseSensitive) {
        list = list.map(f=>{ return f.toLowerCase(); });
        list_two = list_two.map(f=>{ return f.toLowerCase(); });
    }
    
    for(let i in from_list) {
        if(list_in.indexOf(from_list[i]) == -1) return false
    }
    return true
}


module.exports.removeDuplicates = removeDuplicates
/**
 * removeDuplicates(): Supprime les doublons d'une liste
 */
function removeDuplicates(list) {
    return list.filter((x, i) => i === list.indexOf(x))
}

module.exports.sleep = sleep
/**
 * f() : Sleep le nombre de milisecondes précisées
 * @param {string} user_id - L'id de l'utilisateur a check
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}



module.exports.compareString = compareString
/**
 * f() : Renvoie une valeur entre 0 et 1 du taux de similitude entre les deux chaines
 * @param {string} string1 - Première chaine de texte
 * @param {string} string2 - Deuxième chaine de texte
 */
function compareString(string1, string2) {
    // v1.0 from 18/04/2022
    if(string1 == string2) return 1;
    if(string1 == "" || string2 == "") return 0
    let total_count = 0;
    let ok_count = 0;
    for(let longueur_test = 1; longueur_test < string1.length+1; longueur_test++) {
        let morceau;
        for(let multiplier = 0; multiplier <  ((string1.length)/longueur_test)+1; multiplier++ ) {
            let index = longueur_test*multiplier
            if(string1.length > index) {
                total_count++
                let the_string = string1.substr(index, longueur_test)
                if(string2.indexOf(the_string) != -1) {
                    ok_count += 0.5
                } else if(string2.toLowerCase().indexOf(the_string) != -1){
                    ok_count += 0.45
                } else if(string2.indexOf(the_string.toLowerCase()) != -1){
                    ok_count += 0.45
                } else {
                    //logger.log(`No '${the_string}' in '${string2}' `)
                }
            }
            if(string2.length > index) {
                let the_string = string2.substr(index, longueur_test)
                if(string1.indexOf(the_string) != -1) {
                    ok_count += 0.5
                } else if(string1.toLowerCase().indexOf(the_string) != -1){
                    ok_count += 0.45
                } else if(string1.indexOf(the_string.toLowerCase()) != -1){
                    ok_count += 0.45
                } else {
                    //logger.log(`No '${the_string}' in '${string1}' `)
                }
            }
        }

    }

    let a = string1.length
    let b = string2.length

    let ponderation;
    if( (b/a) == 1) {
        ponderation = 1
    } else if( (b/a) > 1 ) {
        ponderation = (a/b)
    } else {
        ponderation = (b/a)
    }

    let score = (ok_count/total_count)*ponderation

    return score
}

/**
 * parseHTMLpart(): retourne le morceau de document html généré à partir du code html donné en texte brut
 * @param {string} string - Code html en texte brut
 * @returns html document
 */
 module.exports.parseHTMLpart = parseHTMLpart
 function parseHTMLpart(string) {
     let DOMparser = new DOMParser(); // DOMparser.parseFromString("string")
     let string2 = `<div class="ZojGHNZkjZOJzcAEJNGZACILkgjhazLCDigjhlibzdfcikbgzakCieeeeeeeeebdhbikhbfIZHKCDFikZAC">${string}</div>`
     //console.log(string2)
     let a = DOMparser.parseFromString(string2, "text/html")
     let b = a.getElementsByClassName("ZojGHNZkjZOJzcAEJNGZACILkgjhazLCDigjhlibzdfcikbgzakCieeeeeeeeebdhbikhbfIZHKCDFikZAC")[0].firstChild
     return b
 }


async function getMenusCrous() {
    //console.log("debug 1")
    let browser = await puppeteer.launch({})
    //console.log("debug 2")
    let page = await browser.newPage()
    //console.log("debug 3")

    await page.goto('https://www.crous-bordeaux.fr/restaurant/resto-u-le-capu/')
    
    var element = await page.waitForSelector("html body div#wrapper div#content div#inner div#menu-repas div.flex-viewport ul.slides")
    var text = await page.evaluate(element => { return element.innerHTML}, element)
    let temp = text.split("\n").map(x=>x.trim()).join("")
    let temp2 = temp.split("</li><li ")
    let temp3 = temp2.map(x => {
        let y = x.split(">")
        y.shift()
        return `<li>${y.join(">")}</li>`
    })

    function _getMonthNumFromName(string) {
        string = string.split("é").join("e").split("è").join("e").split("û").join("u")
        switch(string) {
            case "janvier": return 0
            case "fevrier": return 1
            case "mars": return 2
            case "avril": return 3
            case "mai": return 4
            case "juin": return 5
            case "juillet": return 6
            case "aout": return 7
            case "septembre": return 8
            case "octobre": return 9
            case "novembre": return 10
            case "decembre": return 11
        }
    }

    function getDateFromString(string) {
        let temp1 = string.split(" ")
        temp1.shift()
        temp1.shift()
        temp1.shift()
        
        let d = new Date()
        d.setHours(0)
        d.setMinutes(0)
        d.setSeconds(1)
        d.setMilliseconds(0)
        d.setDate(temp1[0])
        d.setMonth(_getMonthNumFromName(temp1[1]))
        d.setFullYear(temp1[2])
        return d
    }

    function getMenu(elem) {
        let json = {}
        let lastKey = ""
        //console.log("getMenu elem:",elem)
        for(let i in elem.childNodes) {
            //console.log("AB 1")
            if(elem.childNodes[i].nodeName == "span") {
                //console.log("AB 2")
                lastKey = elem.childNodes[i].textContent
                json[lastKey] = []
                continue;
            } else if(elem.childNodes[i].nodeName == "ul") {
                //console.log("AB 3")
                for(let i2 in elem.childNodes[i].childNodes) {
                    let the_li = elem.childNodes[i].childNodes[i2]
                    //console.log("AB 4")
                    if(the_li.textContent == "undefined" || the_li.textContent == undefined || the_li.textContent == "") continue;
                    json[lastKey].push(`${the_li.textContent}`)
                }
            }
        }
        //console.log("getmenu json:",json)
        return json
    }

    let temp4 = temp3.map((item,index) => {
        let p = parseHTMLpart(item)
        let the_title = p.getElementsByTagName("h3")[0].textContent
        let the_date = getDateFromString(the_title)
        return {
            title: the_title,
            menu: getMenu(p.getElementsByClassName("content")[0].getElementsByClassName("content-repas")[1].getElementsByTagName("div")[0]),
            date: {
                timestamp: the_date.getTime(),
                date: the_date
            }
        }
    })

    let temp5 = temp4.sort((a, b) => {
        return a.date.timestamp - b.date.timestamp
    })

    function _getFirstInArrayBySubElement(array, DirectSubelementValueTitle) {
        for(let i in array) {
            if(array[i].title == DirectSubelementValueTitle) return array[i]
        }
        return false
    }


    let uniques = []
    let _temp_last_title = ""
    for(let i in temp5) {
        if(temp5[i].title != _temp_last_title) {
            uniques.push(temp5[i])
            _temp_last_title = temp5[i].title
        }
    }

    //console.log("text temp4:",temp4)
    //console.log("text temp5:",temp5)
    //console.log("uniques:",uniques)
    

    //console.log("text:",text.split("\n").map(x => x.trim()))

    //console.log("text evaluate:", await page.evaluate(el => el.innerHTML, element))

    browser.close()
    return uniques
}
module.exports.getMenusCrous = getMenusCrous