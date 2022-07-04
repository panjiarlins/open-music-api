const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivity({
    playlistId, userId, songId, action,
  }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getPlaylistSongActivitiesById(playlistId) {
    const result = await this._pool.query(`
        SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
        FROM playlists, playlistsongs, users, songs, playlist_song_activities 
        WHERE playlist_song_activities.playlist_id = '${playlistId}'
          AND playlist_song_activities.user_id = users.id
          AND playlist_song_activities.song_id = songs.id
    `);

    if (!result.rowCount) {
      throw new NotFoundError('Aktivitas tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
