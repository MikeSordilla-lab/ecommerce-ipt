<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

if (!is_logged_in()) {
    redirect('/pages/auth/login.php');
}

$role = get_user_role();
switch ($role) {
    case 'admin':
        redirect('/pages/admin/dashboard.php');
        break;
    case 'seller':
        redirect('/pages/seller/dashboard.php');
        break;
    case 'customer':
        redirect('/pages/customer/shop.php');
        break;
    default:
        redirect('/pages/auth/login.php');
}