const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongsActivities',
  version: '1.0.0',
  register: async (server, { playlistSongActivitiesService, playlistsService }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(playlistSongActivitiesService, playlistsService);
    server.route(routes(playlistSongActivitiesHandler));
  },
};
