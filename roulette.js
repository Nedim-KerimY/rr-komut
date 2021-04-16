const Discord = require('discord.js');
const { stripIndents } = require('common-tags');
const { randomRange, verify } = require('../util/Util.js');
exports.run = async (client, message, args) => {
  
  this.fighting = new Set();
  
	let opponent = message.mentions.users.first()
	if (!opponent) return message.reply("Oynamak istediğin kişiyi etiketlemelisin!")
  
  if (opponent.bot) return message.reply('Botlar ile oynayamazsın!');
  if (opponent.id === message.author.id) return message.reply('Kendin ile düello atamazsın!');
		if (this.fighting.has(message.channel.id)) return message.reply('Kanal başına sadece bir rus ruleti meydana gelebilir.');
		this.fighting.add(message.channel.id);
		try {
			if (!opponent.bot) {
                await message.channel.send(`${opponent}, rus ruleti isteği geldi. Rulet'i kabul ediyor musun? (\`evet\` veya \`hayir\` olarak cevap veriniz.)`);
				const verification = await verify(message.channel, opponent);
				if (!verification) {
					this.fighting.delete(message.channel.id);
					return message.channel.send(`Kabul edilmedi.`);
				}
			}
			let userHP = 1;
			let oppoHP = 1;
			let userTurn = false;
			let guard = false;
			const reset = (changeGuard = true) => {
				userTurn = !userTurn;
				if (changeGuard && guard) guard = false;
			};
			const dealDamage = damage => {
				if (userTurn) oppoHP -= damage;
				else userHP -= damage;
			};
			const forfeit = () => {
				if (userTurn) userHP = 0;
				else oppoHP = 0;
			};
			while (userHP > 0 && oppoHP > 0) { 
				const user = userTurn ? message.author : opponent;
				let choice;
				if (!opponent.bot || (opponent.bot && userTurn)) {
					await message.channel.send(stripIndents`
						${user}, ne yapmak istersin? \`pas\`, \`çevir\`, veya \`kaç\`?
						**${message.author.username}**: ${userHP} :heartpulse:
						**${opponent.username}**: ${oppoHP} :heartpulse:
					`);
					const filter = res =>
						res.author.id === user.id && ['pas', 'çevir', 'kaç'].includes(res.content.toLowerCase());
					const turn = await message.channel.awaitMessages(filter, {
						max: 1,
						time: 30000
					});
					if (!turn.size) {
						await message.reply(`Üzgünüm ama, süre doldu!`);
						reset();
						continue;
					}
					choice = turn.first().content.toLowerCase();
				} else {
					const choices = ['pas', 'çevir',];
					choice = choices[Math.floor(Math.random() * choices.length)];
				}
				
				if (choice === 'pas') {
					await message.channel.send(`${user}, Pas geçti!!`);
					guard = false;
					reset(false);
				} else if (choice === 'çevir') {
					const miss = Math.floor(Math.random() * 5);
					if (!miss) {
						const damage = randomRange(1, guard ? 1 : 1);
						await message.channel.send(`${user}, Çevirdin ve ateş ettin rakibini öldürdün :(`);
						dealDamage(damage);
					} else {
						await message.channel.send(`${user}, Maalesef ateş edemedin!`);
					}
					reset();
				} else if (choice === 'kaç') {
					await message.channel.send(`${user}, kaçtı! Korkak!`);
					forfeit();
					break;
				} else {
					await message.reply('Ne yapmak istediğini anlamadım.');
				}
			}
			this.fighting.delete(message.channel.id);
            const winner = userHP > oppoHP ? message.author : opponent;
			return message.channel.send(`Oyun bitti! Tebrikler, **${winner}** kazandı! \n**${message.author.username}`);
		} catch (err) {
			this.fighting.delete(message.channel.id);
			throw err;
		}
  }
exports.conf = {
  aliases: ['rulet', 'rusr', 'rr'],
  permLevel: 0,
  kategori: 'Eğlence'
};
exports.help = {
  name: 'rus-ruleti',
  description: 'aga rus ruleti kbilgi yaptı',
  usage: 'rulet <@kullanıcı>'
};
