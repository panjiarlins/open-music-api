class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const { user, header } = await this._service.getUserById(id);

    const response = {
      status: 'success',
      data: {
        user,
      },
    };

    return header ? h.response(response).header(header.key, header.value) : response;
  }
}

module.exports = UsersHandler;
