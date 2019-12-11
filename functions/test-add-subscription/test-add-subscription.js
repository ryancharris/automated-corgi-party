const AppSecrets = require('../../secrets');

const Mixer = require('@mixer/client-node');
const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

client.use(
  new Mixer.OAuthProvider(client, {
    clientId: AppSecrets.PARTY_CORGI_CLIENT_ID,
    secret: AppSecrets.PARTY_CORGI_SECRET
  })
);

exports.handler = async (event, context) => {
  try {
    const channelId = 129021271;

    client
      .request(`POST`, `/hooks`, {
        body: {
          events: [`channel:${channelId}:broadcast`],
          kind: 'web',
          url: `https://discordapp.com/api/webhooks/647645997018644519/3hJWQ6W-87TGHhU1RWDJMCSOcc7AbhhmQqir7Z5LWj2ZG5UR3FSn64EK4lu8Brpbe6Ve`
        },
        headers: {
          Authorization: `Secret ${AppSecrets.PARTY_CORGI_SECRET}`,
          'Client-ID': AppSecrets.PARTY_CORGI_CLIENT_ID
        }
      })
      .then(res => {
        console.log(res.body);
      });

    return {
      statusCode: 200,
      body: 'Success!'
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
