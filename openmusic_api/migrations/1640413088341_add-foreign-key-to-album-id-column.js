/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.sql("INSERT INTO albums(id, name, year, inserted_at, updated_at) VALUES ('old_songs', 'old_songs', 2021, 'old_songs', 'old_songs')");
  pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE album_id = NULL");
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");
  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
