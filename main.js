require("dotenv").config();
const axios = require("axios");
const artistId = "775ad383-ac2d-479a-af9d-b561442cb749";

let spotifyAccessToken;
let artistObject = {};

const fetchPlaylist = () => {
  return fetch(`https://api.setlist.fm/rest/1.0/artist/${artistId}/setlists`, {
    headers: {
      "x-api-key": process.env.SETLIST_API_KEY,
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let artistName = data.setlist[0].artist.name;
      let venueName = data.setlist[0].venue.name;
      let eventDate = data.setlist[0].eventDate;
      let tracklist = [];

      data.setlist[1].sets.set[0].song.map((song) => tracklist.push(song.name));
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

const client_id = process.env.SPOTIFY_API_ID;
const client_secret = process.env.SPOTIFY_API_SECRET;

const authOptions = {
  url: "https://accounts.spotify.com/api/token",
  method: "post",
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${client_id}:${client_secret}`
    ).toString("base64")}`,
  },
  params: {
    grant_type: "client_credentials",
  },
};

axios(authOptions)
  .then((response) => {
    if (response.status === 200) {
      return (spotifyAccessToken = response.data.access_token);
      console.log("Access_Token:", spotifyAccessToken);
    }
  })
  .then((token) => {
    return (createPlaylist = {
      url: "https://api.spotify.com/v1/users/bill19922/playlists",
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        content_type: "application/json",
      },
      json: {
        name: "New playlist",
        public: true,
        description: "A new playlist",
      },
    });
  })
  .then((playlist) => {
    console.log(playlist);
    return axios(playlist);
  })
  .then((response) => {
    console.log(response);
    if (response.status === 201) {
      let playlist = response;
      //console.log("Playlist has been created", playlist);
      console.log(spotifyAccessToken);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Create Playlist
