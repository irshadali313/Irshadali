export function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    return document.cookie.split('; ').find((item) => item.startsWith('admin_csrf='))?.split('=').slice(1).join('=') || '';
}
