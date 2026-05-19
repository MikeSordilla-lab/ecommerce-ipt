document.addEventListener("DOMContentLoaded", function () {
  initLoadingStates();
  initCSRFInjection();
  initProductCardAddToCart();
  initWishlistForms();
  initResponsiveTables();
});

function initLoadingStates() {
  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (form.classList.contains("add-to-cart-form")) {
        return;
      }
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn && !submitBtn.classList.contains("no-loading")) {
        submitBtn.classList.add("btn-loading");
        submitBtn.disabled = true;
        var originalText = submitBtn.innerHTML;
        submitBtn.setAttribute("data-original-text", originalText);
        submitBtn.innerHTML = "Loading...";
      }
    });
  });
}

function initWishlistForms() {
  document.querySelectorAll(".wishlist-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var button = form.querySelector('[type="submit"]');
      if (button) {
        button.disabled = true;
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (!data.success) {
            showError("Wishlist Error", data.message || "Please try again.");
            return;
          }

          var icon = button ? button.querySelector("i") : null;
          if (icon) {
            icon.classList.toggle("bi-heart-fill", data.wishlisted);
            icon.classList.toggle("bi-heart", !data.wishlisted);
          }
          showSuccess("Wishlist Updated", data.message || "Wishlist updated.");
        })
        .catch(function () {
          showError("Wishlist Error", "Please try again.");
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
          }
        });
    });
  });
}

function initProductCardAddToCart() {
  document.querySelectorAll(".add-to-cart-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : "";
      var wasDisabled = submitBtn ? submitBtn.disabled : false;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Adding...";
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            updateCartCount(data.cart_count || 0);
            showSuccess(
              "Successfully",
              data.message || "Successfully added to cart.",
            );
          } else {
            showError(
              "Could not add item",
              data.message || "Please try again.",
            );
          }
        })
        .catch(function () {
          showError("Could not add item", "Please try again.");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = wasDisabled;
            submitBtn.innerHTML = originalText;
          }
        });
    });
  });
}

function initResponsiveTables() {
  document
    .querySelectorAll(".table-responsive table")
    .forEach(function (table) {
      var wrapper = table.closest(".table-responsive");
      var headers = Array.prototype.map.call(
        table.querySelectorAll("thead th"),
        function (th) {
          return th.textContent.trim();
        },
      );

      if (!headers.length || !wrapper) {
        return;
      }

      wrapper.classList.add("mobile-card-table");

      table.querySelectorAll("tbody tr").forEach(function (row) {
        Array.prototype.forEach.call(row.children, function (cell, index) {
          var label = headers[index] || "";

          if (label) {
            cell.setAttribute("data-label", label);
          }

          if (!label) {
            cell.classList.add("actions-cell");
          }
        });
      });
    });
}

function initCSRFInjection() {
  var csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (csrfToken) {
    csrfToken = csrfToken.getAttribute("content");
  } else {
    csrfToken = getCSRFToken();
  }

  document.querySelectorAll('form[method="POST"]').forEach(function (form) {
    var existingToken = form.querySelector('input[name="csrf_token"]');
    if (!existingToken && csrfToken) {
      var tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "csrf_token";
      tokenInput.value = csrfToken;
      form.appendChild(tokenInput);
    }
  });
}

function getCSRFToken() {
  var meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
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
    formData.append("csrf_token", csrfToken);
  }

  return fetch(url, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    body: formData,
    credentials: "same-origin",
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch(function (error) {
      console.error("Fetch error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    });
}

function showAlert(type, title, message) {
  Swal.fire({
    icon: type,
    title: title,
    text: message,
    confirmButtonColor: "#533afd",
  });
}

function showSuccess(title, message) {
  showAlert("success", title, message);
}

function showError(title, message) {
  showAlert("error", title, message);
}

function showWarning(title, message) {
  showAlert("warning", title, message);
}

function showInfo(title, message) {
  showAlert("info", title, message);
}

function confirmAction(title, message, callback) {
  Swal.fire({
    icon: "question",
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#533afd",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then(function (result) {
    if (result.isConfirmed && typeof callback === "function") {
      callback();
    }
  });
}

function updateCartCount(count) {
  document.querySelectorAll(".cart-badge").forEach(function (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline";
    } else {
      badge.style.display = "none";
    }
  });
}
