const AppSecrets = require('../../secrets');
const fetch = require('node-fetch');

const { ShortCodeExpireError, OAuthClient } = require('@mixer/shortcode-oauth');
const Mixer = require('@mixer/client-node');
const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

client.use(
  new Mixer.OAuthProvider(client, {
    clientId: AppSecrets.PARTY_CORGI_CLIENT_ID,
    secret: AppSecrets.PARTY_CORGI_SECRET
  })
);

// const oauthClient = new OAuthClient({
//   clientId: AppSecrets.PARTY_CORGI_CLIENT_ID
// });

exports.handler = async (event, context) => {
  try {
    // 1. Fetch list from /fetch-mixer-names
    const streamerList = await fetch(
      `${AppSecrets.SITE_URL}/.netlify/functions/fetch-mixer-names`,
      {
        method: 'post'
      }
    )
      .then(res => res.json())
      .then(data => data)
      .catch(err => console.log(err));

    const mixerUrls = streamerList.mixer;
    console.log('mixerUrls', mixerUrls);

    // const { mixerUrls } = streamerList;
    // console.log(mixerUrls);

    // 2. Get current subscriptions from Mixer
    // const currentSubscriptions = await client.request('GET', `/hooks`).then(res => {
    //   console.log(res.body);
    //   return res.body;
    // });
    // console.log(currentSubscriptions)

    // 3. Check subscriptions, identify URLs to add
    // 4. Add new subscriptions

    return {
      statusCode: 200,
      body: 'Success!'
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
