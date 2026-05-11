<?php

class OrderStatusModule
{
    public const PENDING = 'pending';
    public const SHIPPED = 'shipped';
    public const DELIVERED = 'delivered';

    private const STATUS_LABELS = [
        self::PENDING => 'Pending',
        self::SHIPPED => 'Shipped',
        self::DELIVERED => 'Delivered',
    ];

    private const BADGE_CLASSES = [
        self::PENDING => 'warning',
        self::SHIPPED => 'info',
        self::DELIVERED => 'success',
    ];

    public static function statuses(): array
    {
        return array_keys(self::STATUS_LABELS);
    }

    public static function isValid(string $status): bool
    {
        return array_key_exists($status, self::STATUS_LABELS);
    }

    public static function label(string $status): string
    {
        return self::STATUS_LABELS[$status] ?? ucfirst($status);
    }

    public static function badgeClass(string $status): string
    {
        return self::BADGE_CLASSES[$status] ?? 'secondary';
    }

    public static function canTransition(string $currentStatus, string $newStatus): bool
    {
        if (!self::isValid($currentStatus) || !self::isValid($newStatus)) {
            return false;
        }

        $statuses = self::statuses();
        $currentIndex = array_search($currentStatus, $statuses, true);
        $newIndex = array_search($newStatus, $statuses, true);

        return $newIndex === $currentIndex || $newIndex === $currentIndex + 1;
    }

    public static function selectableStatuses(string $currentStatus): array
    {
        return array_values(array_filter(
            self::statuses(),
            fn($status) => self::canTransition($currentStatus, $status)
        ));
    }
}
