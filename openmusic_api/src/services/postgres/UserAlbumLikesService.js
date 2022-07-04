const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addUserAlbumLike(userId, albumId) {
    const id = `userAlbumLike-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Album gagal disukai');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return 'disukai';
  }

  async deleteUserAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal untuk tidak disukai');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return 'tidak disukai';
  }

  async getTotalUserAlbumLikesByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`user_album_likes:${albumId}`);
      return {
        likes: JSON.parse(result).rowCount,
        header: {
          key: 'X-Data-Source',
          value: 'cache',
        },
      };
    } catch {
      const result = await this._pool.query(`
        SELECT id 
        FROM user_album_likes 
        WHERE album_id = '${albumId}'
      `);

      await this._cacheService.set(`user_album_likes:${albumId}`, JSON.stringify(result));
      return { likes: result.rowCount };
    }
  }

  async verifyUserAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return !!result.rowCount;
  }
}

module.exports = UserAlbumLikesService;
