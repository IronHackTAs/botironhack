const { RTMClient, WebClient } = require("@slack/client");
const {
  isMessage,
  isMessageTo,
  isFromUser,
  messageContainsText,
  messageClean
} = require("./utils");
require("../config/mongo");
const readExcel = require("./connect-drive");
const ModelCohort = require("../models/Cohort");

const defaultOptions = {
  triggerOnWords: ["Ayuda"],
  private: ["TA"],
  connectDrive: ["add"],
  messageColor: "#590088",
  usePictures: true,
  // logger: console,
  rtmOptions: {
    useRtmConnect: true,
    dataStore: false
  }
};

const ironbot = (botToken, options = {}) => {
  let botId;

  const opt = Object.assign({}, defaultOptions, options);
  const rtm = new RTMClient(botToken, opt.rtmOptions);
  const web = new WebClient(botToken);

  rtm.on("message", event => {
    if (
      isMessage(event) &&
      isMessageTo(event) &&
      !isFromUser(event, botId) &&
      messageContainsText(event, opt.triggerOnWords)
    ) {
      console.log(event);

      const msgOptions = {
        channel: event.channel,
        as_user: false,
        username: "Pepe",
        icon_url:
          "https://s3-us-west-2.amazonaws.com/slack-files2/bot_icons/2019-01-31/538562484245_48.png",
        attachments: [
          {
            color: "good",
            // title: "Pepe",
            pretext: "AntePepe :+1:",
            text:
              "Lorem fistrum va usté muy cargadoo no te digo trigo por no llamarte Rodrigor condemor mamaar a peich me cago en tus muelas no puedor.",
            ts: Math.floor(new Date("2019-01-31T13:32:00").getTime() / 1000.0)
          }
        ]
      };

      web.chat.postMessage(msgOptions);
      opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
    } else if (isMessageTo(event, "D")) {
      if (messageContainsText(event, opt.private)) {
        const msgOptions = {
          channel: event.channel,
          as_user: true,
          attachments: [
            {
              color: opt.messageColor,
              title: "Juan"
            }
          ]
        };
        web.chat.postMessage(msgOptions);
      } else if (messageContainsText(event, opt.connectDrive)){
        const {id, cohortName} = messageClean(event)
        readExcel(id)
        .then(result => {
          ModelCohort.findOne({id_GoogleSpreadsheet : id})
          // .lean()
          .then( cohort => {
            if( cohort ) {
              const users = result.sort((user1, user2) => user1.email.localeCompare(user2.email)).map( (user, i) => {
                let newuser = cohort.users[i]
                return Object.assign(Object.create(newuser.constructor.prototype), newuser, user)
              })
              cohort.updateOne({users}).then(console.log).catch(err => console.log(`ERROR UPDATE: ${err}`));
            } else {
              const newCohort = new ModelCohort({
                id_GoogleSpreadsheet:id,
                cohort: cohortName,
                users: result
              })
              newCohort.save()
              .then(console.log)
              .catch(err => console.log(`ERROR SAVE: ${err}`))
            }
          })
          .catch(err => console.log(`ERROR FIND: ${err}`))
        })
      }
    }
  });

  rtm.on("team_join", function(event) {
    console.log(event.user.id);
    web.users.info({ user: event.user.id }).then(({ user }) => {
      ModelCohort.findOne({users:{$elemMatch:{ email: "sofia.jordan2000@gmail.com"}}})
      .then(({cohort}) =>{
      web.im.open({ user: event.user.id }).then(({ channel: { id } }) => {
        web.chat
          .postMessage({
            channel: id,
            as_user: true,
            username: "Sonia",
            attachments: [
              {
                color: opt.messageColor,
                title: `Bienvenido esto es un mensaje genérico generado por un bot. Tu nombre es: ${
                  user.real_name
                }, tu nick: ${user.name} y perteneces a ${cohort || ""} 'cohort'.`
              }
            ]
          })
          .then(({ channel, ts: timestamp }) => {
            web.pins.add({ channel, timestamp });
          });
      });
    })
    });
  });
  rtm.on("authenticated", rtmStartData => {
    botId = rtmStartData.self.id;
    opt.logger.log(
      "info",
      `Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${
        rtmStartData.team.name
      }`
    );
  });

  return {
    rtm,
    web,
    start() {
      return rtm.start();
    }
  };
};

module.exports = ironbot;
