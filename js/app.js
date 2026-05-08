document.addEventListener('DOMContentLoaded', function() {
    initLoadingStates();
    initCSRFInjection();
});

function initLoadingStates() {
    document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn && !submitBtn.classList.contains('no-loading')) {
                submitBtn.classList.add('btn-loading');
                submitBtn.disabled = true;
                var originalText = submitBtn.innerHTML;
                submitBtn.setAttribute('data-original-text', originalText);
                submitBtn.innerHTML = 'Loading...';
            }
        });
    });
}

function initCSRFInjection() {
    var csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        csrfToken = csrfToken.getAttribute('content');
    } else {
        csrfToken = getCSRFToken();
    }

    document.querySelectorAll('form[method="POST"]').forEach(function(form) {
        var existingToken = form.querySelector('input[name="csrf_token"]');
        if (!existingToken && csrfToken) {
            var tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'csrf_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
        }
    });
}

function getCSRFToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

function fetchPost(url, data) {
    var csrfToken = getCSRFToken();

    var formData = new FormData();
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            formData.append(key, data[key]);
        }
    }

    if (csrfToken) {
        formData.append('csrf_token', csrfToken);
    }

    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        return { success: false, message: 'An error occurred. Please try again.' };
    });
}

function showAlert(type, title, message) {
    Swal.fire({
        icon: type,
        title: title,
        text: message,
        confirmButtonColor: '#533afd'
    });
}

function showSuccess(title, message) {
    showAlert('success', title, message);
}

function showError(title, message) {
    showAlert('error', title, message);
}

function showWarning(title, message) {
    showAlert('warning', title, message);
}

function showInfo(title, message) {
    showAlert('info', title, message);
}

function confirmAction(title, message, callback) {
    Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#533afd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(function(result) {
        if (result.isConfirmed && typeof callback === 'function') {
            callback();
        }
    });
}

function updateCartCount(count) {
    var badge = document.querySelector('.cart-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}