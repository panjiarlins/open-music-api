const Joi = require('joi');

const ExportPlaylistsongsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPlaylistsongsPayloadSchema;
