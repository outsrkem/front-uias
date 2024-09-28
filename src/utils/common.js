export function toLoginPage() {
    let url = `/authui/login.html?returnto=${encodeURIComponent(window.location.href)}`;
    return window.location.href = url;
}

export function toUserCenter() {
    let url = `/console/#/accountInfo`;
    return window.location.href = url;
}

export function toConsole() {
    let url = `/console`;
    return window.location.href = url;
}

export function saveNavPath(activePath) {
    window.sessionStorage.setItem('active-path', activePath)
}