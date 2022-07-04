/* eslint-disable camelcase */
const mapDBToModel = ({
  inserted_at, updated_at, cover, ...args
}) => ({
  ...args,
  insertedAt: inserted_at,
  updatedAt: updated_at,
  coverUrl: cover,
});

module.exports = { mapDBToModel };
