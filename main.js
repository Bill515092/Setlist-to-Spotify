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

const fetchPlaylist = () => {
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
      //console.log(artistName, venueName, eventDate, tracklist);

      artistObject = {
        name: artistName,
        venue: venueName,
        date: eventDate,
        tracklist: tracklist,
      };

      return artistObject;
    })
    .catch((error) => console.log(error));
};

fetchPlaylist().then((result) => console.log(result));

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

// getAuthCode();

const getAccessToken = async (authorizationCode) => {
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

const createPlaylist = async (playlist) => {
  const access_token = await getAccessToken(auth_code);
  console.log(access_token);
  const api_url = `https://api.spotify.com/v1/users/${user_id}/playlists`;

  try {
    const response = await axios.post(api_url, JSON.stringify(playlist), {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      data: newPlaylist,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// Create Playlist

createPlaylist(newPlaylist)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error.response.data.error_description);
  });
