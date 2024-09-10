export function toLoginPage() {
    let url = `/authui/login.html?service=${encodeURIComponent(window.location.href)}`;
    return window.location.href = url;
}