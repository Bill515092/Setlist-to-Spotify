require("dotenv").config();

const artistId = "775ad383-ac2d-479a-af9d-b561442cb749";

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

      data.setlist[0].sets.set[0].song.map((song) => tracklist.push(song.name));
      //console.log(artistName, venueName, eventDate, tracklist);

      artistObject.name = artistName;
      artistObject.venue = venueName;
      artistObject.date = eventDate;
      artistObject.tracklist = tracklist;

      return artistObject;
    })
    .catch((error) => console.log(error));
};

fetchPlaylist().then((result) => console.log(result));
