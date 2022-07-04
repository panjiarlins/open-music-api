const PlaylistsongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, {
    usersService,
    songsService,
    playlistsongsService,
    playlistSongActivitiesService,
    playlistsService,
    validator,
  }) => {
    const playlistsongsHandler = new PlaylistsongsHandler(
      usersService,
      songsService,
      playlistsongsService,
      playlistsService,
      playlistSongActivitiesService,
      validator,
    );
    server.route(routes(playlistsongsHandler));
  },
};
