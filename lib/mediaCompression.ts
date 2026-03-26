import imageCompression from 'browser-image-compression';

/**
 * Compresses an image and converts it to WebP format.
 * Uses browser-image-compression which works in any browser without special headers.
 */
export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
        return new File([compressedBlob], newName, { type: 'image/webp' });
    } catch (error) {
        console.error('Image compression error:', error);
        return file; // fallback: return original
    }
};

/**
 * Video files are passed through without conversion.
 * FFmpeg WASM requires SharedArrayBuffer (COOP/COEP headers) that are not
 * available in standard hosting environments. Upload videos directly as MP4/MOV/etc.
 * PocketBase accepts all common video formats natively.
 */
export const compressVideo = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<File> => {
    // Simulate brief processing indicator, then return as-is
    if (onProgress) {
        onProgress(50);
        await new Promise(r => setTimeout(r, 200));
        onProgress(100);
    }
    return file;
};
