class UserAlbumLikesHandler {
  constructor(usersService, albumsService, userAlbumLikesService) {
    this._usersService = usersService;
    this._albumsService = albumsService;
    this._userAlbumLikesService = userAlbumLikesService;

    this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
    this.getTotalUserAlbumLikesByAlbumIdHandler = this.getTotalUserAlbumLikesByAlbumIdHandler.bind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._usersService.verifyUserId(credentialId);
    await this._albumsService.verifyAlbum(albumId);

    let action = null;
    action = await this._userAlbumLikesService.verifyUserAlbumLike(credentialId, albumId);
    if (action) action = await this._userAlbumLikesService.deleteUserAlbumLike(credentialId, albumId);
    else action = await this._userAlbumLikesService.addUserAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: `Album berhasil ${action}`,
    });
    response.code(201);
    return response;
  }

  async getTotalUserAlbumLikesByAlbumIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.verifyAlbum(id);
    const { likes, header } = await this._userAlbumLikesService.getTotalUserAlbumLikesByAlbumId(id);

    const response = {
      status: 'success',
      data: { likes },
    };

    return header ? h.response(response).header(header.key, header.value) : response;
  }
}

module.exports = UserAlbumLikesHandler;
