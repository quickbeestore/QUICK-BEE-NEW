/**
 * Magazine Builder - Image Upload Handler
 * Manages Cloudinary uploads with queue, progress, and blob memory management
 */

class MagazineUploader {
  constructor(cloudinaryConfig = {}) {
    this.config = cloudinaryConfig;
    this.queue = [];
    this.active = 0;
    this.MAX_CONCURRENT = 3;
    this.uploads = new Map(); // track ongoing uploads
  }

  /**
   * Enqueue file for upload
   * Creates thumbnail immediately, uploads full-res in background
   * @returns assetId
   */
  enqueue(file) {
    return new Promise((resolve, reject) => {
      const assetId = 'a' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const thumbUrl = URL.createObjectURL(file);

      // Add to store immediately with local thumbnail
      window.MagazineStore.addAsset({
        id: assetId,
        original_name: file.name,
        width: null,
        height: null,
        size: file.size,
        status: 'uploading',
        thumbnail_url: thumbUrl,
        url: null,
        cloudinary_id: null,
        focal_point: { x: 0.5, y: 0.35 }
      });

      this.queue.push({
        file,
        assetId,
        thumbUrl,
        resolve,
        reject
      });

      this.uploads.set(assetId, { status: 'queued', progress: 0 });
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this.active >= this.MAX_CONCURRENT || !this.queue.length) return;

    this.active++;
    const job = this.queue.shift();

    try {
      // Read image dimensions
      const img = new Image();
      img.onload = async () => {
        const result = await this._uploadToCloudinary(job.file, job.assetId);
        URL.revokeObjectURL(job.thumbUrl); // FREE THE MEMORY

        window.MagazineStore.updateAsset(job.assetId, {
          status: 'ready',
          url: result.secure_url,
          thumbnail_url: this._getThumbnailUrl(result.secure_url),
          cloudinary_id: result.public_id,
          width: img.width,
          height: img.height
        });

        this.uploads.set(job.assetId, { status: 'done', progress: 100 });
        job.resolve(job.assetId);
      };
      img.onerror = () => {
        throw new Error('Invalid image format');
      };
      img.src = job.thumbUrl;
    } catch (error) {
      console.error(`Upload failed for ${job.assetId}:`, error);
      window.MagazineStore.updateAsset(job.assetId, { status: 'error', error: error.message });
      this.uploads.set(job.assetId, { status: 'error', progress: 0 });
      job.reject(error);
    }

    this.active--;
    this._processQueue();
  }

  async _uploadToCloudinary(file, assetId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.config.upload_preset || 'quickbee_magazines');
    formData.append('folder', `magazine_sessions/${window.MagazineStore.getState().session_id}`);
    formData.append('resource_type', 'auto');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          this.uploads.set(assetId, { status: 'uploading', progress });
          window.dispatchEvent(new CustomEvent('upload:progress', {
            detail: { assetId, progress }
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload returned ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));

      xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + (this.config.cloud_name || 'quickbee') + '/auto/upload');
      xhr.send(formData);
    });
  }

  _getThumbnailUrl(cloudinaryUrl) {
    // Transform Cloudinary URL to thumbnail
    // https://res.cloudinary.com/cloud/image/upload/v1/file.jpg
    // → https://res.cloudinary.com/cloud/image/upload/w_300,q_60/v1/file.jpg
    return cloudinaryUrl.replace('/upload/', '/upload/w_300,q_60,c_fill/');
  }

  getStatus(assetId) {
    return this.uploads.get(assetId);
  }

  getAllStatus() {
    return Object.fromEntries(this.uploads);
  }
}

// Global singleton
window.MagazineUploader = new MagazineUploader({
  cloud_name: 'quickbee', // Replace with your cloud name
  upload_preset: 'quickbee_magazines' // Replace with your upload preset
});
