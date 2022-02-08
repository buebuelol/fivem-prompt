ESX = null;

emit('esx:getSharedObject', (obj) => ESX = obj)

on('bube:revive', (id, moderator) => {
    let xPlayer = ESX.GetPlayerFromId(id)
    emitNet('esx_ambulancejob:revive', id) // <- jezeli nie macie takiego triggera to zmiencie
    xPlayer.showNotification('~h~Otrzymałeś revive od administratora! [~r~' + moderator + '~s~]')
})

on('bube:heal', (id, moderator) => {
    let xPlayer = ESX.GetPlayerFromId(id)
    emitNet('esx_basicneeds:healPlayer', id)
    xPlayer.showNotification('~h~Otrzymałeś heala od administratora! [~r~' + moderator + '~s~]')
})

on('bube:skin', (id, moderator) => {
    let xPlayer = ESX.GetPlayerFromId(id)
    emitNet('esx_skin:openSaveableMenu', id)
    xPlayer.showNotification('~h~Otrzymałeś skina od administratora! [~r~' + moderator + '~s~]')
})

on('bube:clear', (id, moderator, gid, cid) => {
    clear(id, moderator, gid, cid)
})

function clear(target, moderator, gid, cid) {
    let xPlayer = ESX.GetPlayerFromId(target)
    let name = GetPlayerName(target)
    let xPlayerInventory = xPlayer.getInventory(true)
    for(let prop in xPlayerInventory) {
        xPlayer.removeInventoryItem(prop, xPlayerInventory[prop].count)
    }
    exports[GetCurrentResourceName()].sendMessage(gid, cid, 'Pomyślnie wyczyszczono ekwipunek gracza **' + name + '**')
    xPlayer.showNotification('~h~~y~' + moderator + '~s~~h~ wyczyścił ci ekwipunek!')
}
