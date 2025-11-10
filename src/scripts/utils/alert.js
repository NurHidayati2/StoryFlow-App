// src/scripts/utils/alert.js
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { withViewTransition } from '../index.js';

/**
 * Show success alert with custom styling
 */
export async function alertSuccess(title, text, confirmButtonText = "OK") {
  return withViewTransition(() => Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-html',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel'
    },
    buttonsStyling: false,
    background: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.4)'
  }));
}

/**
 * Show error alert with custom styling
 */
export async function alertError(title, text, confirmButtonText = "Mengerti") {
  return withViewTransition(() => 
    Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-html',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel'
    },
    buttonsStyling: false,
    background: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.4)'
  }));
}

/**
 * Show confirmation dialog with custom styling
 */
export async function alertConfirm(title, text, confirmText = "Ya", cancelText = "Tidak") {
  return withViewTransition(() => 
    Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-html',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel'
    },
    buttonsStyling: false,
    background: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.4)'
  }));
}

/**
 * Show loading alert
 */
export function alertLoading(title = "Memproses...") {
  return withViewTransition(() => Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title'
    }
  }));
}



/**
 * Close any open alert
 */
export function alertClose() {
  Swal.close();
}
