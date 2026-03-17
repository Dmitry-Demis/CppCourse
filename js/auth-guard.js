// Auth guard — redirect to login if not authenticated
// Include this script in all protected pages (theory, profile)
(function () {
    const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
    if (!user || !user.isuNumber) {
        // Save intended destination so login can redirect back
        sessionStorage.setItem('cpp_redirect_after_login', location.href);
        location.replace('/login.html');
    }
}());
