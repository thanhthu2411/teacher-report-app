const showToast = (message, type='success') => {
    const toast = document.getElementById('toast')
    if (!toast) return

    toast.textContent = message;
    toast.className = `toast ${type}`
    toast.style.display = 'block'

    setTimeout(() => {
        toast.style.display = 'none'
    }, 3000)
}

const flashMessageHandler = () => {
    const flashMessages = document.querySelector('.flash-messages')
    if (!flashMessages) return

    // auto hide after 3 seconds
    setTimeout(() => {
        flashMessages.style.opacity = '0'
        flashMessages.style.transition = 'opacity 0.3s ease'
        
        // remove from DOM after fade completes
        setTimeout(() => {
            flashMessages.remove()
        }, 300)
    }, 3000)
}

export {showToast, flashMessageHandler}