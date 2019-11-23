const fetch = require('node-fetch');

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const streamerMarkdown = await fetch(
      'https://raw.githubusercontent.com/ChristopherBiscardi/party-corgi/master/docs/list-of-streamers.md'
    )
      .then(res => res.text())
      .then(body => {
        return body;
      });

    // const streamerMarkdown = `
    //   # List of streamers in Discord

    //   ### Twitch

    //   https://www.twitch.tv/chrisbiscardi

    //   https://www.twitch.tv/thecodepixi

    //   https://www.twitch.tv/ecomath328

    //   https://www.twitch.tv/horacioh

    //   https://www.twitch.tv/jlengstorf

    //   https://www.twitch.tv/lannonbr

    //   https://www.twitch.tv/roberttables

    //   ### Mixer

    //   https://mixer.com/juicetrades

    //   https://mixer.com/ryanharris

    //   ### Events / Organizations

    //   https://www.twitch.tv/reactadelphia/
    // `;

    const mixerRegex = new RegExp(
      /(https?:\/\/(.+?\.)?mixer\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/g
    );
    const mixerUrls = Array.from(streamerMarkdown.match(mixerRegex));

    const twitchRegex = new RegExp(
      /(https?:\/\/(.+?\.)?twitch\.tv(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/g
    );
    const twitchUrls = Array.from(streamerMarkdown.match(twitchRegex));

    const response = {
      mixer: mixerUrls,
      twitch: twitchUrls
    };
    console.log(response);

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
