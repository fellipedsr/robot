const {dialog} = require('electron')

function sendDialog(title,msg,type){
    const menssage = msg.toUpperCase()
    const tit = title.toUpperCase()
    if(type =='error'){
        dialog.showErrorBox(tit, menssage)
        return
    }

    dialog.showMessageBoxSync({ message: menssage, type: type })
    return
}

module.exports = sendDialog