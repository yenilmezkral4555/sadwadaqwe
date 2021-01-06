const Discord = require("discord.js");
const db = require('quick.db');
exports.run = (client, message, args) => {
  
  
  
// 12. SATIRDA 2. ROL VAR
  
//------------------------------------KANALLAR-----------------------------------\\
const tag = "⌬"; // TAGINIZ (BAŞA GELECEK) 
  
const kayıtlı = message.guild.roles.find(r => r.id === "796111676385918976"); // ERKEK ROLÜNÜN İDSİ
  
const unregister = message.guild.roles.find(r => r.id === "796111677849731142"); // UNREGİSTER ROLÜNÜN İDSİ
  
//------------------------------------KANALLAR-----------------------------------\\ 
  
  
  
  
  
  
//------------------------------------KANALLAR-----------------------------------\\ 
  
  const log = message.guild.channels.find(c => c.id === "796112049905598465"); // KAYIT KANALININ İDSİ
  const genelchat = message.guild.channels.find(c => c.id === "796112053437726740"); // GENEL SOHBET KANALININ İDİSİ
  const dogrulandi = client.emojis.find(emoji => emoji.name === "tik"); // EMOJİ İSMİ (SADECE İSİM : <> FALAN DEĞİL SADECE İSİM)
  if(!message.member.roles.array().filter(r => r.id === "796111670098788423")[0]) { // KAYIT YAPAN ROLÜN İDSİ
    
//------------------------------------KANALLAR-----------------------------------\\    
    



    
//------------------------------------------------ROL-VERME-----------------------------------------------\\     
    
    return message.channel.send("Kayıt Yapabilmek İçin `Kayıt Sorumlusu` Rolüne Sahip Değilsiniz.");
  } else {
    let member = message.mentions.users.first() || client.users.get(args.join(' '))
      if(!member) return message.channel.send("Bir kullanıcı girin.")
    const stg = message.guild.member(member)
    const nick = args[1];
    const yas = args[2];
      if(!nick) return message.channel.send("Bir isim girin.")
      if(!yas) return message.channel.send("Bir yaş girin.")
    stg.setNickname(`${tag} ${nick} | ${yas}`)
    stg.addRole(kayıtlı)
    stg.removeRole(unregister)
    stg.setNickname(`${tag} ${nick} | ${yas}`)
    stg.addRole(kayıtlı)
    stg.removeRole(unregister)
    
//------------------------------------------------ROL-VERME-----------------------------------------------\\  
    
    
    
    
    
    
//------------------------------------------------MESAJ-----------------------------------------------\\    
    
    var user = message.mentions.users.first() || message.author;
    //
    const embed = new Discord.RichEmbed()
    .setThumbnail(message.author.avatarURL)
    .setTitle(`δ Possidentis`)
    .addField( `Kayıt Eden`, `<@${message.author.id}>`) 
    .addField( `Kayıt Edilen`, `${user}`) 
    .addField( `Verilen Rol`, `<@&${kayıtlı.id}>`) 
    .addField( `Alınan Rol`, `<@&${unregister.id}>`)
    .addField( `Yeni İsmin`, `\`${tag} ${nick} | ${yas}\``) 
    .setFooter(`${message.author.username} Tarafından Kayıt Yapıldı`)
    .setColor("0xbf3eff")
    log.send(embed)
    message.react(dogrulandi)
    
        const agla = new Discord.RichEmbed()
        genelchat.send(`<@${stg.user.id}> Aramıza Hoş Geldin <a:like:765972667072380968>

Rollerini alabilirsin buralardan <#796112083241926716> , <#796112084773109771> , <#796112087940071434>  <a:like:765972667072380968>

Keyifli Vakitler Geçirmeni Dileriz <a:like:765972667072380968>.`)         

//------------------------------------------------MESAJ-----------------------------------------------\\      

  
  
  
  }
}
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["e"],
  permLevel: 0
};
exports.help = {
  name: "erkek",
  description: "",
  usage: ""
};
   
