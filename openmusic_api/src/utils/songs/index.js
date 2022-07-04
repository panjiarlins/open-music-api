/* eslint-disable camelcase */
const mapDBToModel = ({
  album_id, inserted_at, updated_at, ...args
}) => ({
  ...args,
  albumId: album_id,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToModel };
