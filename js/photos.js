/* ============================================================
   PHOTOS - Photo management for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Photos = (() => {
  'use strict';

  const H = App.Helpers;
  const DB = App.DB;

  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_WIDTH = 800;
  const QUALITY = 0.8;

  // ── Photo cache (in-memory) ───────────────────────────────
  const photoCache = {};

  /**
   * Compress an image file using Canvas API.
   */
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;

          if (w > MAX_WIDTH) {
            h = Math.round((h * MAX_WIDTH) / w);
            w = MAX_WIDTH;
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          const dataUrl = canvas.toDataURL('image/webp', QUALITY);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Error al procesar la imagen'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate a file for upload.
   */
  function validateFile(file) {
    if (!file) return 'No se seleccionó ningún archivo.';
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Formato no soportado. Usa JPG, PNG o WEBP.';
    if (file.size > MAX_FILE_SIZE) return 'El archivo es demasiado grande (máx. 5MB).';
    return null;
  }

  /**
   * Get the photo URL for an animal (primary photo or placeholder).
   */
  async function getPhotoUrl(animalId, species) {
    if (photoCache[animalId]) return photoCache[animalId];
    try {
      const photo = await DB.PhotoService.getPrimary(animalId);
      if (photo && photo.data) {
        photoCache[animalId] = photo.data;
        return photo.data;
      }
    } catch { /* ignore */ }
    return H.getDefaultPhotoSvg(species || '');
  }

  /**
   * Invalidate photo cache for an animal.
   */
  function invalidateCache(animalId) {
    delete photoCache[animalId];
  }

  /**
   * Upload a photo for an animal.
   */
  async function uploadPhoto(animalId, file) {
    const error = validateFile(file);
    if (error) throw new Error(error);

    const data = await compressImage(file);

    // Set existing photos as non-primary
    const existing = await DB.PhotoService.getByAnimal(animalId);
    for (const p of existing) {
      if (p.is_primary) {
        p.is_primary = false;
        await DB.PhotoService.update(p);
      }
    }

    // Create new primary photo
    const photo = await DB.PhotoService.create({
      animal_id: animalId,
      is_primary: true,
      data: data,
      filename: file.name,
      size: file.size,
      mime_type: file.type,
    });

    invalidateCache(animalId);
    return photo;
  }

  /**
   * Remove a photo.
   */
  async function removePhoto(photoId, animalId) {
    await DB.PhotoService.remove(photoId);
    invalidateCache(animalId);

    // If removed was primary, make next one primary
    const remaining = await DB.PhotoService.getByAnimal(animalId);
    if (remaining.length > 0 && !remaining.some(p => p.is_primary)) {
      remaining[0].is_primary = true;
      await DB.PhotoService.update(remaining[0]);
    }
  }

  /**
   * Open the photo management modal.
   */
  async function openPhotoManager(animalId, species) {
    const photos = await DB.PhotoService.getByAnimal(animalId);
    const currentPhoto = photos.find(p => p.is_primary) || photos[0];

    const previewSrc = currentPhoto ? currentPhoto.data : H.getDefaultPhotoSvg(species);

    const html = `
      <div class="photo-manager">
        <div class="photo-preview-container">
          <img src="${previewSrc}" alt="Foto del animal" class="photo-preview" id="photo-preview">
        </div>
        <div class="photo-actions-zone">
          <label class="btn btn-primary btn-upload" for="photo-file-input">
            📷 ${currentPhoto ? 'Cambiar Foto' : 'Subir Foto'}
          </label>
          <input type="file" id="photo-file-input" accept=".jpg,.jpeg,.png,.webp" style="display:none">
          ${currentPhoto ? `<button class="btn btn-danger btn-sm" id="photo-remove-btn">🗑️ Eliminar</button>` : ''}
        </div>
        <p class="photo-hint">Formatos: JPG, PNG, WEBP — Máx. 5MB</p>
        <div id="photo-error" class="form-error"></div>
      </div>
    `;

    App.UI.showModal({
      title: '📸 Gestión de Fotografía',
      contentHtml: html,
      showFooter: false,
    });

    // Wire up file input
    const fileInput = document.getElementById('photo-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const errorEl = document.getElementById('photo-error');
        const validationError = validateFile(file);
        if (validationError) {
          if (errorEl) errorEl.textContent = validationError;
          return;
        }
        if (errorEl) errorEl.textContent = '';

        try {
          // Show preview immediately
          const preview = document.getElementById('photo-preview');
          const reader = new FileReader();
          reader.onload = (ev) => { if (preview) preview.src = ev.target.result; };
          reader.readAsDataURL(file);

          await uploadPhoto(animalId, file);
          App.UI.showToast('Foto actualizada correctamente', 'success');
          App.UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          if (errorEl) errorEl.textContent = err.message;
          App.UI.showToast('Error al subir foto: ' + err.message, 'error');
        }
      });
    }

    // Wire up remove
    const removeBtn = document.getElementById('photo-remove-btn');
    if (removeBtn && currentPhoto) {
      removeBtn.addEventListener('click', async () => {
        App.UI.showConfirm('¿Eliminar esta fotografía?', async () => {
          try {
            await removePhoto(currentPhoto.id, animalId);
            App.UI.showToast('Foto eliminada', 'success');
            App.UI.closeModal();
            App.Router.resolve();
          } catch (err) {
            App.UI.showToast('Error: ' + err.message, 'error');
          }
        }, 'Eliminar Foto');
      });
    }
  }

  return {
    compressImage,
    validateFile,
    getPhotoUrl,
    invalidateCache,
    uploadPhoto,
    removePhoto,
    openPhotoManager,
    ACCEPTED_TYPES,
    photoCache,
  };
})();
