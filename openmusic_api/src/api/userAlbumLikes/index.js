const UserAlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'userAlbumLikes',
  version: '1.0.0',
  register: async (server, { usersService, albumsService, userAlbumLikesService }) => {
    const playlistsongsHandler = new UserAlbumLikesHandler(usersService, albumsService, userAlbumLikesService);
    server.route(routes(playlistsongsHandler));
  },
};
