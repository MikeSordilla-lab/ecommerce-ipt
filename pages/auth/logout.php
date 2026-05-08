<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';

session_destroy();
session_start();

set_flash('success', 'Logged Out', 'You have been successfully logged out.');
redirect(SITE_URL . '/pages/auth/login.php');