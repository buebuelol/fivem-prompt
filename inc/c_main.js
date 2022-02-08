let ESX = null;

emit('esx:getSharedObject', (obj) => ESX = obj)

onNet('bube:showScaleform', (name) => {
    ESX.Scaleform.ShowFreemodeMessage('~r~zapraszam na rzadowy', 'Zostałeś wezwany przez: ~b~' + name, 5)
})
