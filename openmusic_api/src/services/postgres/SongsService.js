const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils/songs');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, insertedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete(`songs:${id}`);
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let queryConditions = '';
    if (title || performer) {
      queryConditions += 'WHERE ';
      queryConditions += title ? `title ilike '%${title}%' AND ` : '';
      queryConditions += performer ? `performer ilike '%${performer}%' AND ` : '';
      queryConditions = queryConditions.slice(0, -4);
    }

    const result = await this._pool.query(`SELECT id, title, performer FROM songs ${queryConditions}`);
    return result.rows;
  }

  async getSongById(id) {
    try {
      const result = await this._cacheService.get(`songs:${id}`);
      return {
        song: JSON.parse(result),
        header: {
          key: 'X-Data-Source',
          value: 'cache',
        },
      };
    } catch {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const mappedResult = result.rows.map(mapDBToModel)[0];
      await this._cacheService.set(`songs:${id}`, JSON.stringify(mappedResult));
      return { song: mappedResult };
    }
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${id}`);
  }

  async verifySong(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
