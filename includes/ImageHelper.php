<?php

class ImageHelper
{
    public const MAX_IMAGE_SIZE = 2097152;

    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png' => ['png'],
        'image/webp' => ['webp'],
    ];

    public static function validateUploadedImage(array $file): array
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'No file uploaded'];
        }

        if (($file['size'] ?? 0) > self::MAX_IMAGE_SIZE) {
            return ['success' => false, 'message' => 'File too large. Max 2MB allowed'];
        }

        $tmpName = $file['tmp_name'] ?? '';
        if ($tmpName === '' || !is_file($tmpName)) {
            return ['success' => false, 'message' => 'Invalid uploaded file'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo === false) {
            return ['success' => false, 'message' => 'Could not validate file type'];
        }

        $mimeType = finfo_file($finfo, $tmpName);
        finfo_close($finfo);

        if (!isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            return ['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, WebP'];
        }

        $extension = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_MIME_TYPES[$mimeType], true)) {
            return ['success' => false, 'message' => 'Invalid file extension'];
        }

        return [
            'success' => true,
            'mime_type' => $mimeType,
            'extension' => $extension,
        ];
    }

    public static function moveUploadedImage(array $file, string $uploadDir, string $publicBaseUrl, string $filenamePrefix): array
    {
        $validation = self::validateUploadedImage($file);
        if (!$validation['success']) {
            return $validation;
        }

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            return ['success' => false, 'message' => 'Failed to prepare upload directory'];
        }

        $filename = self::generateFilename($filenamePrefix, $validation['extension']);
        $uploadPath = rtrim($uploadDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            return ['success' => false, 'message' => 'Failed to save file'];
        }

        return [
            'success' => true,
            'filename' => $filename,
            'path' => $uploadPath,
            'url' => rtrim($publicBaseUrl, '/') . '/' . $filename,
        ];
    }

    public static function resolveProductImage(?string $imagePath): ?string
    {
        $imagePath = trim((string)$imagePath);
        return $imagePath !== '' ? $imagePath : null;
    }

    private static function generateFilename(string $prefix, string $extension): string
    {
        $safePrefix = preg_replace('/[^a-zA-Z0-9_-]+/', '_', $prefix);
        $safePrefix = trim((string)$safePrefix, '_');
        if ($safePrefix === '') {
            $safePrefix = 'image';
        }

        return $safePrefix . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    }
}
