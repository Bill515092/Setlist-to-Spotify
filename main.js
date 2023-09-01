require("dotenv").config();
const axios = require("axios");
const qs = require("querystring");
const base64 = require("base64-url");

const artistId = "775ad383-ac2d-479a-af9d-b561442cb749";
const client_id = process.env.SPOTIFY_API_ID;
const client_secret = process.env.SPOTIFY_API_SECRET;
const auth_code = process.env.SPOTIFY_AUTH_CODE;
const authorize = "https://accounts.spotify.com/authorize?";
const scopes = "playlist-modify-public playlist-modify-private";
const redirect_uri = "https://www.google.co.uk";
const user_id = "hardimehnt";
const authURL =
  "https://accounts.spotify.com/authorize?client_id=83b22c59449c47c0a7755d3427a6de25&response_type=code&redirect_uri=https://www.google.co.uk&show_dialog=true&scope=playlist-modify-public playlist-modify-private";

let artistObject = {};
const newPlaylist = {
  name: "Test playlist",
  description: "A test playlist 1",
  public: true,
};

let newSearch = {
  q: "The Summoning",
  type: "track",
  market: "GB",
  limit: 1,
};

let uriArr = [];

const fetchSetlist = () => {
  return fetch(`https://api.setlist.fm/rest/1.0/artist/${artistId}/setlists`, {
    headers: {
      "x-api-key": process.env.SETLIST_API_KEY,
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let artistName = data.setlist[2].artist.name;
      let venueName = data.setlist[2].venue.name;
      let eventDate = data.setlist[2].eventDate;
      let tracklist = [];

      data.setlist[2].sets.set[0].song.map((song) => tracklist.push(song.name));

      artistObject = {
        name: artistName,
        venue: venueName,
        date: eventDate,
        tracklist: tracklist,
      };

      newSearch = {
        q: tracklist,
        type: "track",
        market: "GB",
        limit: 1,
      };

      return { artistObject, newSearch };
    })
    .catch((error) => console.log(error));
};

fetchSetlist().then((result) => console.log());

// Token Request

const authUser = () => {
  let url = authorize;
  url += `client_id=${client_id}`;
  url += "&response_type=code";
  url += "&redirect_uri=https://www.google.co.uk";
  url += "&show_dialog=true";
  url += `&scope=${scopes}`;

  console.log(url);
};

// const getAuthCode = async () => {
//   try {
//     const response = await axios.get(`${authURL}`);

//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// };

const getClientAuthOptions = async (clientCode) => {
  try {
    const tokenData = {
      grant_type: "client_credentials",
      code: encodeURIComponent(clientCode),
      redirect_uri,
    };

    const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString(
      "base64"
    );
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify(tokenData), // Add qs.stringify here if required
      {
        headers: {
          Authorization: `Basic ${authHeader}`, // Add space after "Basic"
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.log("Error getting access token:", error.message);
    throw error;
  }
};
// getAuthCode();

const getUserAuthOptions = async (authorizationCode) => {
  try {
    const tokenData = qs.stringify({
      grant_type: "authorization_code",
      code: encodeURIComponent(authorizationCode),
      redirect_uri,
    });

    const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString(
      "base64"
    );
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      tokenData,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.log("Error getting access token:", error.message);
    throw error;
  }
};

// const createPlaylist = async (playlist) => {
//   const access_token = await getUserAuthOptions(auth_code);
//   console.log(access_token);
//   const api_url = `https://api.spotify.com/v1/users/${user_id}/playlists`;

//   try {
//     const response = await axios.post(api_url, JSON.stringify(playlist), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//         "Content-Type": "application/json",
//       },
//       data: newPlaylist,
//     });

//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// Create Playlist

// createPlaylist(newPlaylist)
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.log(error.response.data.error_description);
//   });

// Track Search

const trackSearch = async (track) => {
  const access_token = await getClientAuthOptions();
  //console.log(access_token);
  const api_url = "https://api.spotify.com/v1/search";

  const response = await axios.get(api_url, {
    params: {
      q: track.q,
      type: track.type,
      market: track.market,
      limit: track.limit,
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  return response;
};

const tracklistSearch = async () => {
  try {
    const response = await fetchSetlist();
    console.log(response);
    return response;
  } catch (error) {
    //console.log(error);
  }
};

tracklistSearch(newSearch).then(async (response) => {
  try {
    let uriArr = [];

    await Promise.all(
      response.newSearch.q.map(async (track) => {
        const trackResponse = await trackSearch({
          q: `track${encodeURIComponent(track)}%20artist:${encodeURIComponent(
            response.artistObject.name
          )}`,
          type: "track",
          market: "GB",
          limit: 1,
        });

        trackResponse.data.tracks.items.map((song) => {
          uriArr.push(song.uri);
        });
      })
    );
    console.log(uriArr);
    return uriArr;
  } catch (error) {
    console.error("Error:", error);
  }
});
