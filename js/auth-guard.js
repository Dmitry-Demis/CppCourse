// Auth guard — redirect to login if not authenticated
// Include this script in all protected pages (theory, profile)
(async function () {
    const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
    if (!user || !user.isuNumber) {
        sessionStorage.setItem('cpp_redirect_after_login', location.href);
        location.replace('/login.html');
        return;
    }

    // Validate against server — if user deleted from DB, clear cache and redirect
    try {
        const res = await fetch(`/api/profile/${user.isuNumber}`, {
            headers: { 'X-Isu-Number': user.isuNumber }
        });
        if (!res.ok) {
            localStorage.removeItem('cpp_user');
            sessionStorage.setItem('cpp_redirect_after_login', location.href);
            location.replace('/login.html');
        }
    } catch {
        // Offline — allow through (can't validate)
    }
}());
