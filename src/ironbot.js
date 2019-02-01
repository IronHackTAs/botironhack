const { RTMClient, WebClient } = require('@slack/client');
const {
  isMessage,
  isMessageTo,
  isFromUser,
  messageContainsText
}=  require('./utils');


const defaultOptions = {
  triggerOnWords: ['pepe'],
  private:["TA"],
  messageColor: '#590088',
  usePictures: true,
  logger: console,
  rtmOptions: {
    useRtmConnect: true,
    dataStore: false,
  },
};

const ironbot = (botToken, options = {}) => {
  let botId;

  const opt = Object.assign({}, defaultOptions, options);
  const rtm = new RTMClient(botToken, opt.rtmOptions);
  const web = new WebClient(botToken);

  rtm.on("message", (event) => {
    if (
      isMessage(event) &&
      isMessageTo(event) &&
      !isFromUser(event, botId) &&
      messageContainsText(event, opt.triggerOnWords)
    ) {
      const msgOptions = {
        channel: event.channel,
        as_user: false,
        username: "Pepe",
        icon_url: "https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2019-01-31/538562484245_48.png",
        attachments: [{
          color: "good",
          // title: "Pepe",
          pretext:"AntePepe :+1:",
          text: "Lorem fistrum va usté muy cargadoo no te digo trigo por no llamarte Rodrigor condemor mamaar a peich me cago en tus muelas no puedor.",
          ts:Math.floor(new Date('2019-01-31T13:32:00').getTime()/1000.0)
        }],
      };

      web.chat.postMessage(msgOptions)
      opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
    } else if ((isMessageTo(event, "D")) && messageContainsText(event, opt.private)){
      const msgOptions = {
        channel:event.channel,
        as_user:true,
        attachments: [{
          color: opt.messageColor,          
          title:"Juan"
        }]
      }
      web.chat.postMessage(msgOptions);
    }
  });

  rtm.on("team_join", function(event){
    web.users.info(event.user.id).then(({user}) => {
      web.im.open(event.user.id).then(({channel:{id}}) => {
        web.chat.postMessage({
          channel: id,
          as_user: true,
          attachments: [{
            color: opt.messageColor,
            title: "Yisus te escucha"
          }]
        }).then(({channel, ts:timestamp}) => {
          web.pins.add({channel, timestamp})
        });
      })
    })
  })
  rtm.on("authenticated", (rtmStartData) => {
    botId = rtmStartData.self.id;
    opt.logger.info(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
  });

  return {
    rtm,
    web,
    start() { rtm.start(); },
  };
};

module.exports = ironbot;
