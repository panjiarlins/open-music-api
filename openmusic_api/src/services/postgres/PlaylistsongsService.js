const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistsong(songId, playlistId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
  }

  async getPlaylistsongsById(playlistId) {
    const playlistResult = await this._pool.query(`
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists, users 
        WHERE playlists.id = '${playlistId}' AND playlists.owner = users.id
    `);
    const songsResult = await this._pool.query(`
        SELECT songs.id, songs.title, songs.performer 
        FROM playlistsongs, songs 
        WHERE playlistsongs.playlist_id = '${playlistId}' AND playlistsongs.song_id = songs.id
    `);

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async deletePlaylistsong(songId, playlistId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus');
    }
  }

  async verifyCollaborator(songId, playlistId) {
    const query = {
      text: 'SELECT * FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2',
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal diverifikasi');
    }
  }
}

module.exports = PlaylistsongsService;
