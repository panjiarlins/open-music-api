const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${owner}`);
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const result = await this._cacheService.get(`playlists:${owner}`);
      return {
        playlists: JSON.parse(result),
        header: {
          key: 'X-Data-Source',
          value: 'cache',
        },
      };
    } catch {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
          LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
          LEFT JOIN users ON playlists.owner = users.id 
          WHERE playlists.owner = $1 OR collaborations.user_id = $1 
          GROUP BY playlists.id, users.username
        `,
        values: [owner],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`playlists:${owner}`, JSON.stringify(result.rows));
      return { playlists: result.rows };
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus');
    }

    await this._cacheService.delete(`playlists:${result.rows[0].owner}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
