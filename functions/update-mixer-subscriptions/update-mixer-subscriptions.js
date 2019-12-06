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

    if (currentSubscriptions.length) {
      // 3. Parse channel IDs from subscription data, create array
      const currenSubscriptionIds = currentSubscriptions.map(sub => {
        const broadcastEvent = sub.events.find(event => event.includes(':broadcast'));

        const channelIdRegex = new RegExp(/(\d+)/g);
        const idArr = Array.from(broadcastEvent.match(channelIdRegex));

        return parseInt(idArr[0]);
      });
      console.log(' ********* currenSubscriptionIds', currenSubscriptionIds);

      // 4. Get Mixer IDs from MD list based on URL
      const updatedSubscriptionIds = mixerUrls.map(async url => {
        // Parse username from URL
        const usernameRegex = new RegExp(/(\w+)$/gim);
        const usernameArr = Array.from(url.match(usernameRegex));

        // Get info about each user based on their user name and parse data
        return client.request('GET', `/users/search?query=${usernameArr[0]}`).then(res => {
          const user = res.body[0];
          return {
            userId: user.id,
            username: user.username,
            channelId: user.channel.id
          };
        });
      });

      // Resolves all of the Promises created by the .map() call above
      Promise.all(updatedSubscriptionIds).then(subscriptions => {
        // 5. Check subscriptions, identify URLs to add
        const newChannelIds = subscriptions.filter(sub => {
          console.log('sub', sub);
          return !currenSubscriptionIds.includes(sub.channelId);
        });
        console.log('newChannelIds', newChannelIds);
      });

      // 6. Add new subscriptions
    }

    return {
      statusCode: 200,
      body: 'Success!'
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
