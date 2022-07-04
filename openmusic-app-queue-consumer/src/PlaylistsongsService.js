const { Pool } = require('pg');

class PlaylistsongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistsongsById(playlistId) {
    const playlistResult = await this._pool.query(`
        SELECT id, name 
        FROM playlists 
        WHERE id = '${playlistId}'
    `);
    const songsResult = await this._pool.query(`
        SELECT songs.id, songs.title, songs.performer 
        FROM playlistsongs, songs 
        WHERE playlistsongs.playlist_id = '${playlistId}' AND playlistsongs.song_id = songs.id
    `);

    return {
      playlist: {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      },
    };
  }
}

module.exports = PlaylistsongsService;
