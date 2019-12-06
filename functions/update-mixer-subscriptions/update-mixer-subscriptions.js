const AppSecrets = require('../../secrets');
const fetch = require('node-fetch');

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

    // 2. Get current hooks from Mixer
    const currentSubscriptions = await client
      .request('GET', `/hooks`, {
        headers: {
          Authorization: `Secret ${AppSecrets.PARTY_CORGI_SECRET}`
        }
      })
      .then(res => {
        console.log(res.body);
        return res.body;
      });
    console.log(' ********* currentSubscriptions', currentSubscriptions);

    // 3. Parse channel IDs from subscription data, create array
    const currenSubscriptionIds = currentSubscriptions.map(sub => {
      const broadcastEvent = sub.events.find(event => event.includes(':broadcast'));

      const channelIdRegex = new RegExp(/(\d+)/g);
      const idArr = Array.from(broadcastEvent.match(channelIdRegex));

      return idArr[0];
    });
    console.log(' ********* currenSubscriptionIds', currenSubscriptionIds);

    // 4. Get Mixer IDs from MD list based on URL
    // const userSearch = await client.request('GET', `/users/search?query=ryanharris`).then(res => {
    //   console.log(res.body);
    //   return res.body;
    // });
    // console.log(' ********* userSearch', userSearch);

    // 5. Check subscriptions, identify URLs to add

    // 6. Add new subscriptions

    return {
      statusCode: 200,
      body: 'Success!'
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
