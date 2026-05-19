<?php
require_once __DIR__ . '/../ValidationHelper.php';

function validateAddressInput(array $data): array
{
    $errors = [];

    $fullName = trim($data['full_name'] ?? '');
    if (empty($fullName)) {
        $errors[] = 'Full name is required.';
    } elseif (strlen($fullName) < 2 || strlen($fullName) > 100) {
        $errors[] = 'Full name must be 2-100 characters.';
    }

    $phone = trim($data['phone'] ?? '');
    if (empty($phone)) {
        $errors[] = 'Phone number is required.';
    } elseif (normalize_ph_mobile($phone) === null) {
        $errors[] = 'Phone must be a Philippine mobile number, e.g. 09171234567 or +639171234567.';
    }

    $address = trim($data['address'] ?? '');
    if (empty($address)) {
        $errors[] = 'Address is required.';
    } elseif (strlen($address) < 10 || strlen($address) > 500) {
        $errors[] = 'Address must be 10-500 characters.';
    }

    return $errors;
}

function createAddress(PDO $pdo, int $userId, array $data, bool $setAsDefault = false): int
{
    $fullName = trim($data['full_name']);
    $phone = normalize_ph_mobile($data['phone']) ?? trim($data['phone']);
    $address = trim($data['address']);

    $pdo->beginTransaction();

    try {
        if ($setAsDefault) {
            $stmt = $pdo->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1");
            $stmt->execute([$userId]);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO addresses (user_id, full_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$userId, $fullName, $phone, $address, $setAsDefault ? 1 : 0]);

        $addressId = (int) $pdo->lastInsertId();

        $pdo->commit();

        return $addressId;
    } catch (PDOException $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function setDefaultAddress(PDO $pdo, int $userId, int $addressId): void
{
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1");
        $stmt->execute([$userId]);

        $stmt = $pdo->prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$addressId, $userId]);

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function deleteAddress(PDO $pdo, int $userId, int $addressId): bool
{
    $stmt = $pdo->prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$addressId, $userId]);

    return $stmt->rowCount() > 0;
}

function getAddressesByUser(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare(
        "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC"
    );
    $stmt->execute([$userId]);

    return $stmt->fetchAll();
}
