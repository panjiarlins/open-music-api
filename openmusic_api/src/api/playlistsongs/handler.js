class PlaylistsongsHandler {
  constructor(usersService, songsService, playlistsongsService, playlistsService, playlistSongActivitiesService, validator) {
    this._usersService = usersService;
    this._songsService = songsService;
    this._playlistsongsService = playlistsongsService;
    this._playlistsService = playlistsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._validator = validator;

    this.postPlaylistsongHandler = this.postPlaylistsongHandler.bind(this);
    this.getPlaylistsongsByIdHandler = this.getPlaylistsongsByIdHandler.bind(this);
    this.deletePlaylistsongByIdHandler = this.deletePlaylistsongByIdHandler.bind(this);
  }

  async postPlaylistsongHandler(request, h) {
    this._validator.validatePlaylistsongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this._usersService.verifyUserId(credentialId);
    await this._songsService.verifySong(songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsongsService.addPlaylistsong(songId, playlistId);
    await this._playlistSongActivitiesService.addPlaylistSongActivity({
      playlistId, userId: credentialId, songId, action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getPlaylistsongsByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const songs = await this._playlistsongsService.getPlaylistsongsById(playlistId);

    return {
      status: 'success',
      data: { playlist: songs },
    };
  }

  async deletePlaylistsongByIdHandler(request) {
    this._validator.validatePlaylistsongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this._usersService.verifyUserId(credentialId);
    await this._songsService.verifySong(songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsongsService.deletePlaylistsong(songId, playlistId);
    await this._playlistSongActivitiesService.addPlaylistSongActivity({
      playlistId, userId: credentialId, songId, action: 'delete',
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsongsHandler;
