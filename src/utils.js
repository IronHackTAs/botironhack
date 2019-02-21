/* eslint no-restricted-syntax: "off" */

const isMessage = event => Boolean(event.type === 'message' && event.text);

//Type C = channel; Type D = private message
const isMessageTo = (message, type = "C") => typeof message.channel === 'string' && message.channel[0] === type;

const isFromUser = (event, userId) => event.user === userId;

const messageContainsText = (message, possibleTexts) => {
  const messageText = message.text.toLowerCase();
  const texts = Array.isArray(possibleTexts) ? possibleTexts.map(wordPrivate => wordPrivate.toLowerCase()) : [possibleTexts.toLowerCase()];

  const exits = texts.some( wordPrivate => messageText.includes(wordPrivate));
  // Pasar por watson por peso de palabra *
  // Quisiste decir **
  if(exits){
    return messageText.split(" ").some( word => texts.includes(word.toLowerCase()));
  } 
    return false;
  
};

const messageClean = (message) => {
  const messageSplit = message.text.split(" ")
  return {id:messageSplit[1], cohortName: messageSplit[2]};
}


module.exports = {
  isMessage,
  isMessageTo,
  isFromUser,
  messageContainsText,
  messageClean
}