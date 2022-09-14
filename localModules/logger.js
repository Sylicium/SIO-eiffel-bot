

function getDate() {
    let d = (new Date())
    return `${d.getHours()}:`.padStart(3,"0") + `${d.getMinutes()}:`.padStart(3,"0") + `${d.getSeconds()},`.padStart(3,"0") + `${d.getMilliseconds()}`.padStart(3,"0")
}

module.exports = {
    log: (...args) => { console.log(`[ ][${getDate()}][LOG]`, ...args)},
    info: (...args) => { console.log(`[ ][${getDate()}][INFO]`, ...args)},
    warn: (...args) => { console.log(`[ ][${getDate()}][WARN]`, ...args)},
    error: (...args) => { console.log(`[ ][${getDate()}][ERROR]`, ...args)},
    debug: (...args) => { console.log(`[ ][${getDate()}][DEBUG]`, ...args)},
    success: (...args) => { console.log(`[ ][${getDate()}][SUCCESS]`, ...args)},
}