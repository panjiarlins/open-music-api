class ExportsHandler {
  constructor(playlistsService, producerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = producerService;
    this._validator = validator;

    this.postExportPlaylistsongsHandler = this.postExportPlaylistsongsHandler.bind(this);
  }

  async postExportPlaylistsongsHandler(request, h) {
    this._validator.validateExportPlaylistsongsPayload(request.payload);

    const userId = request.auth.credentials.id;
    const { targetEmail } = request.payload;
    const { id: playlistId } = request.params;
    const message = { playlistId, targetEmail };

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._producerService.sendMessage('export:playlistsongs', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
