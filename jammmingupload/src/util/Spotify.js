
const clientID = 'd9e26b901acd4404b55e9fdb2fecdbce';
const redirectUri = "http://deployjammming.surge.sh";
const apiURL = 'https://api.spotify.com/v1';
const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=token&scope=playlist-modify-public&client_id=${clientID}&redirect_uri=${redirectUri}`;
let userAccessToken = undefined;
let expiresIn = undefined;

const Spotify = {
	getAccessToken(){
		if(userAccessToken){
			return new Promise(resolve => resolve(userAccessToken));
		}
		const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
		const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);
		if(urlAccessToken && urlExpiresIn){
			userAccessToken = urlAccessToken[1];
			expiresIn = urlExpiresIn[1];
			window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
			window.history.pushState('Access Token', null, '/');
		}
		else{
			window.location = spotifyUrl;
		}
	},

	search(term){
		const searchUrl = `${apiURL}/search?type=track&q=${term}`;
		return fetch(searchUrl, {headers: {Authorization: `Bearer ${userAccessToken}`}})
		.then(response => response.json())
		.then(jsonResponse => {
			if(!jsonResponse.tracks) return [];
			return jsonResponse.tracks.items.map(track => {
				return {
					id: track.id,
					name: track.name,
					artist: track.artists[0].name,
					album: track.album.name,
					uri: track.uri
				}
			})
		});
	},

	savePlaylist(name, trackUris){
		if(!name || !trackUris || trackUris.length === 0) return;
		let userUrl = 'htpps://api.spotify.com/v1/me';
		const headers = {Authorization: `Bearer ${userAccessToken}`};
		let userID = undefined;
		let playlistID = undefined;

		return fetch(userUrl, {headers: headers})
		.then(response => response.json())
		.then(jsonResponse => {
			userID = jsonResponse.id;
			userUrl = `${apiURL}/users/${userID}/playlists`;
			let body = {name: name};
			let thePost = { headers: headers, method: 'POST', body: JSON.stringify(body)};

			return fetch(userUrl, thePost).then(response => response.json()
				).then(jsonResponse => jsonResponse.id).then(playlistID => {
					console.log("Spotify.playlistid: " + playlistID);
					userUrl = `${apiURL}/users/${userID}/playlists/${playlistID}/tracks`;;
					body = {uris: trackUris };
					thePost = {headers: headers, method: 'POST', body: JSON.stringify(body)};
					return fetch(userUrl, thePost).then(response => console.log("Spotify said: " + response));
			});
		});
	}
	
};

export default Spotify;