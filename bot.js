const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json"); //UrfaKebab
const chalk = require("chalk");
const moment = require("moment");
var Jimp = require("jimp"); //UrfaKebab
const { Client, Util } = require("discord.js");
const weather = require("weather-js"); //UrfaKebab//UrfaKebab
const fs = require("fs");
const db = require("quick.db"); //UrfaKebab
const http = require("http");
const express = require("express"); //UrfaKebab
require("./util/eventLoader.js")(client);
const path = require("path"); //UrfaKebab
const request = require("request");
const snekfetch = require("snekfetch");
const queue = new Map();
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");

const app = express(); //UrfaKebab
app.get("/", (request, response) => {
  console.log(Date.now() + "UrfaKebab");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`${message}`);
}; //UrfaKebab

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    }); //UrfaKebab
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   UrfaKebab(chalk.bgBlue.green(e.replace(regTokenfynx 'that was redacted')));
// }); //DEVİLHOUSE//

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.login(ayarlar.token);

//---------------------------------KOMUTLAR---------------------------------\\

//dsadsdasadadasdsdsaddad

client.on("roleDelete", async role => {
  let guild = role.guild;
  if (!guild.me.hasPermission("MANAGE_ROLES")) return;
  let koruma = db.fetch(`korumaacik_${role.guild.id}`);
  if (koruma == null) return;
  let e = await guild.fetchAuditLogs({ type: "ROLE_DELETE" });
  let member = guild.members.get(e.entries.first().executor.id);
  if (!member) return;
  if (member.hasPermission("ADMINISTRATOR")) return;
  let mention = role.mentionable;
  let hoist = role.hoist;
  let color = role.hexColor;
  let name = role.name;
  let perms = role.permissions;
  let position = role.position;
  role.guild
    .createRole({
      name: name,
      color: color,
      hoist: hoist,
      position: position,
      permissions: perms,
      mentionable: mention
    })
    .then(rol => {
      if (!db.has(`korumalog_${guild.id}`)) return;
      let logs = guild.channels.find(
        ch => ch.id === db.fetch(`korumalog_${guild.id}`)
      );
      if (!logs) return db.delete(`korumalog_${guild.id}`);
      else {
        const embed = new Discord.RichEmbed()
          .setDescription(
            `Silinen Rol: <@&${rol.id}> (Yeniden oluşturuldu!)\nSilen Kişi: ${member.user}`
          )
          .setColor("RED")
          .setAuthor(member.user.tag, member.user.displayAvatarURL);
        logs.send(embed);
      }
    });
});
client.on("channelDelete", async channel => {
  if (!channel.guild.me.hasPermission("MANAGE_CHANNELS")) return;
  let guild = channel.guild;
  const logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" });
  let member = guild.members.get(logs.entries.first().executor.id);
  if (!member) return;
  if (member.hasPermission("ADMINISTRATOR")) return;
  channel
    .clone(channel.name, true, true, "Kanal silme koruması sistemi")
    .then(async klon => {
      if (!db.has(`korumalog_${guild.id}`)) return;
      let logs = guild.channels.find(
        ch => ch.id === db.fetch(`korumalog_${guild.id}`)
      );
      if (!logs) return db.delete(`korumalog_${guild.id}`);
      else {
        const embed = new Discord.RichEmbed()
          .setDescription(
            `Silinen Kanal: <#${klon.id}> (Yeniden oluşturuldu!)\nSilen Kişi: ${member.user}`
          )
          .setColor("RED")
          .setAuthor(member.user.tag, member.user.displayAvatarURL);
        logs.send(embed);
      }
      await klon.setParent(channel.parent);
      await klon.setPosition(channel.position);
    });
});

//Tag Alana Rol

client.on("userUpdate", async (old, rm) => {
  let tag = "δ";
  let rolid = "749199986297929749";
  let kanal = "754619045084397628";
  let sunucuid = "748948569611829298";

  if (old.username !== rm.username) {
    if (
      !rm.username.includes(tag) &&
      client.guilds
        .get(sunucuid)
        .members.get(rm.id)
        .roles.has(rolid)
    ) {
      client.guilds
        .get(sunucuid)
        .members.get(rm.id)
        .removeRole(rolid);
      client.channels
        .get(kanal)
        .send(
          `${rm}, "${tag}" tagını çıkardığı için **δ Possidentis | Family** rolü alındı`
        );
    }

    if (
      rm.username.includes(tag) &&
      !client.guilds
        .get(sunucuid)
        .members.get(rm.id)
        .roles.has(rolid)
    ) {
      client.channels
        .get(kanal)
        .send(
          `${rm}, "${tag}" tagını aldığı için **δ Possidentis | Family** rolü verildi`
        );
      client.guilds
        .get(sunucuid)
        .members.get(rm.id)
        .addRole(rolid);
    }
  }
});

//sdasadad

client.on("message", msg => {
  let küfürEngel = db.fetch(`ke_${msg.guild.id}`);
  if (!msg.guild) return;
  if (küfürEngel === "kapali") return;
  if (küfürEngel === "acik") {
    var request = require("request");
    request(`https://endlesslove-apii.glitch.me/kufur`, function(
      error,
      response,
      body
    ) {
      if (error) return console.log("Hata:", error);
      else if (!error) {
        var veri = JSON.parse(body);
        if (
          veri.kelimeler.some(word => msg.content.toLowerCase().includes(word))
        ) {
          if (!msg.member.hasPermission("ADMINISTRATOR")) {
            msg.delete();
            msg.channel
              .send(
                new Discord.RichEmbed()
                  .setColor("#000000")
                  .setDescription(
                    "Bu Sunucudu Küfür-engelleme filitresi açık. küfür edemezsin!!"
                  )
              )
              .then(message => message.delete(3000));
          }
        }
      }
    });
  }
});

//sa-as
client.on("message", async (msg, member, guild) => {
  let i = await db.fetch(`saas_${msg.guild.id}`);
  if (i === "açık") {
    if (msg.content.toLowerCase() === "sa") {
      msg.reply("<a:hareketlikalpsol:760124902576881675>__**^^Aleyküm selam, hoş geldin ^^**__<a:hareketlikalpsag:760124902471761931>");
    }
  }
});

client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`reklamFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const reklam = [
      "discord.app",
      "discord.gg",
      "dicord",
      "discordapp",
      "discordgg",
      ".com",
      ".net",
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".tr",
      ".az"
    ];
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_GUILD")) {
          msg.delete();
          let embed = new Discord.RichEmbed()
            .setColor(0xffa300)
            .setFooter("Bot  -|-  Reklam engellendi.", client.user.avatarURL)
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL
            )
            .setDescription(
              "Bot Reklam sistemi, " +
                `***${msg.guild.name}***` +
                " adlı sunucunuzda reklam yakaladım."
            )
            .addField(
              "Reklamı yapan kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(`${msg.author.tag}, **Reklam Yapmak Yasak!**`)
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

//kufur engel
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`küfürFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const küfür = [
      "amcık",
       "AMCIK",
      "yarrak",
       "YARRAK",
      "orospu",
      "OROSPU",
      "piç",
      "PİÇ",
      "sikerim",
      "SİKERİM",
      "sikik",
      "SİKİK",
      "amına",
      "AMINA",
      "pezevenk",
      "PEZEVENK",
      "yavşak",
      "YAVŞAK",
      "ananı",
      "ANANI",
      "anandır",
      "ANANDIR",
      "orospu",
      "OROSPU",
      "evladı",
      "EVLADI",
      "göt",
      "GÖT",
      "pipi",
      "PİPİ",
      "sokuk",
      "SOKUK",
      "yarak",
      "YARRAK",
      "bacını",
      "karını",
      "amk",
      "AMK",
      "aq",
      "AQ",
      "mk",
      "MK",
      "anaskm",
      "amk",
      "sik",
      "SİK",
      "salak",
      "SALAK",
      "amk"
    ];
    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_WEBHOOKS")) {
          msg.delete();
          let embed = new Discord.RichEmbed()
            .setColor(0xffa300)

            .setDescription(
              +`***${msg.guild.name}***` + " adlı sunucunuzda küfür yapıldı!"
            )
            .addField(
              "Küfür Eden Kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg
            .reply(`Küfür etmek yasaktır!`)
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

// rol koruma
client.on("roleDelete", async (role, channel, message, guild) => {
  let rolkoruma = await db.fetch(`rolk_${role.guild.id}`);
  if (rolkoruma == "acik") {
    role.guild.createRole({
      name: role.name,
      color: role.color,
      permissions: role.permissions
    });
    role.guild.owner.send(
      ` **${role.name}** Adlı Rol Silindi Ve Ben Rolü Tekrar Oluşturdum  :white_check_mark::`
    );


  }
});
    //sunucu panel
client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.on("guildMemberAdd", async member => {
  let sunucupaneli = await db.fetch(`sunucupanel_${member.guild.id}`);
  if (sunucupaneli) {
    let rekoronline = await db.fetch(`panelrekor_${member.guild.id}`);
    let toplamuye = member.guild.channels.find(x =>
      x.name.startsWith("∞ Toplam Üye •")
    );
    let toplamaktif = member.guild.channels.find(x =>
      x.name.startsWith("∞ Aktif Üye •")
    );
    let botlar = member.guild.channels.find(x =>
      x.name.startsWith("∞ Botlar •")
    );

    if (
      member.guild.members.filter(off => off.presence.status !== "offline")
        .size > rekoronline
    ) {
      db.set(
        `panelrekor_${member.guild.id}`,
        member.guild.members.filter(off => off.presence.status !== "offline")
          .size
      );
    }
    try {
      toplamuye.setName(`Toplam Üye • ${member.guild.members.size}`);
      toplamaktif.setName(
        `Aktif Üye • ${
          member.guild.members.filter(off => off.presence.status !== "offline")
            .size
        }`
      );
      botlar.setName(
        `Botlar • ${member.guild.members.filter(m => m.user.bot).size}`
      );
    } catch (e) {}
  }
});
//sunucupanel
client.on("guildMemberRemove", async member => {
  let sunucupaneli = await db.fetch(`sunucupanel_${member.guild.id}`);
  if (sunucupaneli) {
    let rekoronline = await db.fetch(`panelrekor_${member.guild.id}`);
    let toplamuye = member.guild.channels.find(x =>
      x.name.startsWith("Toplam Üye •")
    );
    let toplamaktif = member.guild.channels.find(x =>
      x.name.startsWith("Aktif Üye •")
    );
    let botlar = member.guild.channels.find(x => x.name.startsWith("Botlar •"));
    let rekoraktif = member.guild.channels.find(x =>
      x.name.startsWith("Rekor Aktiflik •")
    );

    if (
      member.guild.members.filter(off => off.presence.status !== "offline")
        .size > rekoronline
    ) {
      db.set(
        `panelrekor_${member.guild.id}`,
        member.guild.members.filter(off => off.presence.status !== "offline")
          .size
      );
    }
    try {
      toplamuye.setName(`Toplam Üye • ${member.guild.members.size}`);
      toplamaktif.setName(
        `Aktif Üye • ${
          member.guild.members.filter(off => off.presence.status !== "offline")
            .size
        }`
      );
      botlar.setName(
        `Botlar • ${member.guild.members.filter(m => m.user.bot).size}`
      );
      rekoraktif.setName(`Rekor Aktiflik • ${rekoronline}`);
    } catch (e) {}
  }
});

//---------------------------------KOMUTLAR---------------------------------\\

client.on("message", message => {
  const dmchannel = client.channels.find(
    channelbotdm => channelbotdm.name === "name"
  );
  if (message.channel.type === "dm") {
    if (message.author.bot) return;
    dmchannel.sendMessage("", {
      embed: {
        color: 3447003,
        title: `Gönderen: ${message.author.tag}`,
        description: `Bota Özelden Gönderilen DM: ${message.content}`
      }
    });
  }
});

//---------------------------------KOMUTLAR---------------------------------\\

client.on("channelDelete", async function(channel) {
  if (channel.guild.id !== "758314127193014313") return;
  let logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" });
  if (logs.entries.first().executor.bot) return;
  channel.guild
    .member(logs.entries.first().executor)
    .roles.filter(role => role.name !== "@everyone")
    .array()
    .forEach(role => {
      channel.guild
        .member(logs.entries.first().executor)
        .removeRole(channel.guild.roles.get("silinicek rol id")); // 1
      channel.guild
        .member(logs.entries.first().executor)
        .removeRole(channel.guild.roles.get("silinicek rol id")); // 2
      channel.guild
        .member(logs.entries.first().executor)
        .removeRole(channel.guild.roles.get("silinicek rol id")); // 3
    });
  const sChannel = channel.guild.channels.find(c => c.id === "log-2");
  const cıks = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setDescription(
      `${channel.name} Adlı Kanal Silindi Silen kişinin yetkilerini alıyorum.`
    )
    .setFooter("ModLogger | Discord Bot");
  sChannel.send(cıks);

  channel.guild.owner.send(
    ` **${channel.name}** Adlı Kanal Silindi Silen Kişinin Yetkilerini Alıyorum.`
  );
});

//---------------------------------KOMUTLAR---------------------------------\\


//---------------------------------KOMUTLAR---------------------------------\\





//bot koruma

client.on("guildMemberAdd", async member => {
  if (db.has(`botkoruma_${member.guild.id}`) === false) return;
  if (member.user.bot === false) return;
  if (db.has(`botİzinli_${member.id}`) === true) return;

  member.kick(member, `Bot Koruması Aktif!`);

  member.guild.owner.send(
    `Sunucunuza Bir Bot Eklendi ve Sunucudan Otomatik Olarak Atıldı, Sunucuya Eklenmesini Onaylıyor iseniz \`!giriş-izni ${member.id}\``
  );
});


//--------------------------------------------------------------------------------------------------------------
//ROL SİLİNCE YETKİSİNİ ÇEKME
client.on('roleDelete', async (role) => {
   
    const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
    const yetkili = await role.guild.members.get(entry.executor.id);
    const eskihali = role.permissions;
          console.log(eskihali)
   if (yetkili.id === "749352852018692156")return;                                                                               
             let embed = new Discord.RichEmbed()
             .setColor("RED")
             .setDescription(`<@${yetkili.id}> isimli kişi ${role.id} ID'li rolü sildi ve sahip olduğu tüm rolleri alarak, kendisine \`CEZALI\` rolünü verdim.`)
             .setTimestamp()
             let roles = role.guild.members.get(yetkili.id).roles.array()
                    try {
                         role.guild.members.get(yetkili.id).removeRoles(roles)
                                                                             
                         }
              catch(err) {
                          console.log(err)
                         } 
    setTimeout(function(){
                         role.guild.members.get(yetkili.id).addRole("749199998637441084")
                         role.guild.owner.send(embed)
                         }, 1500);

                  });

 //SİLİNEN KANALI ESKİ AYARIYLA GERİ AÇMA, SİLEN KİŞİSİNİN YETKİSİNİ ALMA!
client.on('channelDelete', async (channel) => {
 
 const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());
 const yetkili = await channel.guild.members.get(entry.executor.id);
     if (yetkili.id === "750274409973153812")return;
     if (yetkili.id === "749352852018692156")return;
                
                                                
 channel.clone(channel.name, true, true, 'Silinen kanal geri açıldı')
 .then(clone => console.log(` ${channel.name} silinen kanal  ${clone.name} ismiyle yeniden açıldı.`))
 .catch(console.error);

                                                                                
 let embed = new Discord.RichEmbed()
.setColor("RED")
.setDescription(`<@${yetkili.id}> isimli kişi ${channel.id} ID'li kanalı sildi ve sahip olduğu tüm rolleri alarak, kendisine <@&CEZALI PERMİNİZİN İD> (CEZALI) rolünü verdim.`)
.setTimestamp()
 let roles = channel.guild.members.get(yetkili.id).roles.array()
 try {
channel.guild.members.get(yetkili.id).removeRoles(roles)
                                                                           
  }
 catch(err) {
 console.log(err)
 } 
 setTimeout(function(){
      channel.guild.members.get(yetkili.id).addRole("749199998637441084")
      channel.guild.owner.send(embed)
               }, 1500);

                                                                               
                                                                                     
     }); 

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

//
client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === '!tag') {
message.channel.send(`**⌬**`)
}
})

client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === '.tag') {
message.channel.send(`**⌬**`)
}
})

client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === '-tag') {
message.channel.send(`**⌬**`)
}
})

client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === '/tag') {
message.channel.send(`**⌬**`)
}
})

client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === 'selamın aleyküm') {
message.channel.send(`<@${message.author.id}>,**__<a:hareketlikalpsol:760124902576881675>^^Aleyküm selam, hoş geldin ^^<a:hareketlikalpsag:760124902471761931>__**`)
}
})

client.on('message', message => {
let tag = message.content.toLowerCase()

if(tag === 'Selamın aleyküm') {
message.channel.send(`<@${message.author.id}>,**__<a:hareketlikalpsol:760124902576881675>^^Aleyküm selam, hoş geldin ^^<a:hareketlikalpsag:760124902471761931>__**`)
}
})
//////////////////////

/////////

//KAYIT MESAJ
//NOT Kendi isteğinize göre burada ki yazıları değiştirin!
client.on("guildMemberAdd", (member, message) => {
  const sunucuid = "748948569611829298"; //Sunucu id
  const id = "796112049905598465"; //Kanal id
  const jail = "796111657113616434"; //jail rol id
  const kayıtsız = "796111677849731142"; //Kayıtsız rol id
  if (member.guild.id !== sunucuid) return;
  var üyesayısı = member.guild.members.size.toString().replace(/ /g, "    ");
  var üs = üyesayısı.match(/([0-9])/g);
  üyesayısı = üyesayısı.replace(/([a-zA-Z])/g, "bilinmiyor").toLowerCase();
  if (üs) {
    üyesayısı = üyesayısı.replace(/([0-9])/g, d => {
      return {
        "0": `<a:0_1:760534107674378282>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "1": `<a:1_1:760534098640633866>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "2": `<a:2_1:760534101903147028>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "3": `<a:3_1:760534102356262915>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "4": `<a:4_1:760534101484371969>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "5": `<a:5_1:760534084975460413>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "6": `<a:6_1:760534045859512410>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "7": `<a:7_1:760534100452048917>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "8": `<a:8_1:760534108824010792>`, // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
        "9": `<a:9_1:760534108086206484>`
      }[d]; // YAPMAYI BİLMİYORSAN VİDEOYU DİKKATLİ İZLE
    });
  }
  let aylartoplam = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
  };
  let aylar = aylartoplam;
  let user = client.users.get(member.id);
  require("moment-duration-format");
  let eskiNick = member.user.username;
  const channel = member.guild.channels.get(id);
  const kurulus = new Date().getTime() - user.createdAt.getTime();
  const gün = moment.duration(kurulus).format("D");
  var kontrol;
  if (gün < 7) {
    kontrol = "Güvenilmeyen Kullanıcı ❌";
    member.addRole(jail);
  }
  if (gün > 7) {
    kontrol = "Güvenilir Kullanıcı ✅";
    member.addRole(kayıtsız);
  }

  let codearius = new Discord.RichEmbed()
    .setAuthor(`⌬ BLOOD MOON Ailesine Hoşgeldin`)
    .setDescription(
      `**・ Sunucumuza Hoş geldin ${member}

・<@&796111670098788423> Manager Rolündeki Yetkililer Seninle İlgilenecektir

・ Kaydının Yapılması İçin V. Confirmed kanallarının birine giriniz

・Tag vardır isteyen alabilir almayabilir alanlara <@&796111671772708915> rolü verilecek

 <a:degerli1:750246616102993946> ・Seninle beraber  ${üyesayısı}   kişiyiz <a:tik:750245700306206730>** `
    )

    .addField(
      "Hesap Oluşturma Tarihi",
      `\`${moment(user.createdAt).format("DD")} ${
        aylar[moment(user.createdAt).format("MM")]
      } ${moment(user.createdAt).format("YYYY")}\``,
      true
    )
    .addField("Bu Hesap", `\`${kontrol}\``, true)
    .setColor("RANDOM")
    .setTimestamp();
  channel.send(codearius);
});
//


//-----------------------GİRENE-ROL-VERME----------------------\\     STG

client.on("guildMemberAdd", member => {
  member.addRole("796111677849731142"); // UNREGİSTER ROLÜNÜN İDSİNİ GİRİN
});

