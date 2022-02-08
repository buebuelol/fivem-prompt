var ESX = null;
const Discord = require('discord.js');
const config = require("./config.json")
const client = new Discord.Client()
emit("esx:getSharedObject", (obj) => ESX = obj);
const mysql = require("mysql")

const con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.db,
})

con.connect((err) => {
    if (err) throw err
    console.log('# polaczono z baza danych')
})


client.on('ready', () => {
    console.clear()
    console.log(client.user.tag + ' || ' + client.user.id)
    setInterval(() => {
      client.user.setActivity('「' + GetNumPlayerIndices() + '/' + GetConvar('sv_maxclients') + '」')
    }, 5000)
})

global.exports('sendMessage', (gid, cid, content) => {
    if (!cid || !content) return console.log('missing arguments')
    let channel = client.guilds.get(gid).channels.get(cid)
    if (!channel) return console.log('nie znaleziono kanału')
    channel.send(content)
})

client.on('message', (message) => {
    if (message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'revive') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0];
        if (!id) return message.reply("Nie podano ID gracza!")
        if (GetPlayerName(id) === null) return message.reply("Nie znaleziono takiego gracza!")



        emit("bube:revive", id, message.author.tag);

        message.channel.send("**" + GetPlayerName(id) + '(' + id + ")** został zrevivowany!")
    }

    if (command === 'info') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")
        let id = args[0];
        if (!id) return message.reply("Nie podano ID gracza!")
        if (isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        if (GetPlayerName(id) === null) return message.reply("Nie znaleziono takiego gracza!")
        let name = GetPlayerName(id);
        let lrk = 'Brak';
        let steamid = 'Brak';
        let did = 'Brak';

        for (let i = 0; i < GetNumPlayerIdentifiers(id); i++) {
            const identifier = GetPlayerIdentifier(id, i);
            if (identifier.includes('steam:')) steamid = identifier

            if (identifier.includes('license:')) lrk = identifier

            if (identifier.includes('discord:')) did = identifier
        }

        const embed = new Discord.RichEmbed().setTitle("Informacje o graczu").setColor("BLUE").setTimestamp().addField('Nazwa', '```' + name + "```", true).addField('ID', '```' + id + '```', true).addField('Hex', '```' + steamid + '```', true).addField('Discord ID: ', '```' + did + '```', true).addField('Licencja Rockstar: ', '```' + lrk + '```', true).setFooter(GetNumPlayerIndices() + " graczy")
        message.channel.send(embed)
    }


    if (command == 'skin') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0];
        if (!id) return message.reply("Nie podano ID gracza!")
        if (isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        let name = GetPlayerName(id);
        if (name === null) return message.reply("Nie znaleziono takiego gracza!")

        emit('bube:skin', id, message.author.tag)
        message.channel.send('Nadano skina dla **' + name + '(' + id + ')**')
    }


    if (command == 'heal') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0];
        if (!id) return message.reply("Nie podano ID gracza!")
        if (isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        let name = GetPlayerName(id);
        if (name === null) return message.reply("Nie znaleziono takiego gracza!")

        emit('bube:heal', id)
        message.channel.send('Uleczono **' + name + '(' + id + ')**')
    }


    if (command === 'addhex') {
        if(!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")
            
             let hex = args[0];
             if(!hex) return message.reply("Nie podano hexa!")
             if(hex.startsWith('steam:')) return message.reply('Podaj hexa bez przedrostka steam!')
   
            con.query('SELECT identifier FROM whitelist WHERE identifier = ?', ["steam:"+hex], function(err, result) {
                if(err) throw err
                if(result[0]) return message.reply('**' + hex + '** jest już na whiteliście!'); else {
                    con.query('INSERT INTO whitelist (identifier) VALUES (?)', ["steam:"+hex], function(err) {
                        if(err) throw err
                        message.channel.send("**" + hex + "** został dodany!")     
                    })   
                }
            })
     }
   
     if (command === 'delhex') {
        if(!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")
            
             let hex = args[0];
             if(!hex) return message.reply("Nie podano hexa!")
             if(hex.startsWith('steam:')) return message.reply('Podaj hexa bez przedrostka steam!')
   
            con.query('SELECT identifier FROM whitelist WHERE identifier = ?', ["steam:"+hex], function(err, result) {
                if(err) throw err
                if(!result[0]) return message.reply('**' + hex + '** nie znajduje się na whiteliście!'); else {
                    con.query('DELETE FROM whitelist WHERE identifier = ?', ["steam:"+hex], function(err) {
                        if(err) throw err
                        message.channel.send("**" + hex + "** został usunięty!")     
                    })   
                }
            })
     }

    if (command == 'setjob') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0];
        let job = args[1]
        let grade = args[2]
        if (!id) return message.reply("Nie podano ID gracza!")
        if (!job) return message.reply("Nie podano joba!")
        if (!grade) return message.reply("Nie podano stopnia joba!")
        if (isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        let name = GetPlayerName(id);
        if (name === null) return message.reply("Nie znaleziono takiego gracza!")

        emit('bube:setJob', id, job, grade, message.author.tag, message.guild.id, message.channel.id)
    }

    if(command == 'geteq') {
        if(!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0]
        if (!id) return message.reply("Nie podano id gracza!")
        if(isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        if(GetPlayerName(id) == null) return message.reply("Nie znaleziono takiego gracza!")
        let name = GetPlayerName(id); let user = ESX.GetPlayerFromId(id); let userinventory = user.getInventory(true)
        if(userinventory == '[]') return message.reply('Użytkownik nie posiada zadnych itemow!')
        let array = []
        for(let i in userinventory) {
            let item = user.getInventoryItem(i)
            array.push(`${item.label} [${item.count}/${item.limit}]\n`)
        }
        const embed = new Discord.RichEmbed().setAuthor(name).setColor('#4287f5').setDescription('``` ' + array.join(' ') + '```').setFooter(`${message.author.tag} || ${message.author.id}`).setTimestamp()
        message.channel.send(embed)
    }

    if(command == 'rzadowy') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")
        let id = args[0];
        if (!id) return message.reply("Nie podano ID gracza!")
        if (isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        if (GetPlayerName(id) == null) return message.reply("Nie znaleziono takiego gracza!")
        emitNet('bube:showScaleform', id, message.author.tag)
        message.channel.send(`**${GetPlayerName(id)}(${id})** został wezwany na rządowy!`)
    }

    if (command == 'cleareq') {
        if (!message.member.roles.has(config.authorizedrole)) return message.reply("Nie posiadasz do tego permisji!")

        let id = args[0];
        if (!id) return message.reply("Nie podano id gracza!")
        if(isNaN(id)) return message.reply("Podane ID jest nieprawidłowe!")
        if(GetPlayerName(id) == null) return message.reply("Nie znaleziono takiego gracza!")
        emit('bube:clear', id, message.author.tag, message.guild.id, message.channel.id)
    }
})


client.login(config.token)