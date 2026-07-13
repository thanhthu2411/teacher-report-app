

const addClassFormHander = () => {
    const addBtn = document.getElementById("add-class-btn");
    if (!addBtn) return;
    const modal = document.getElementById("add-class-modal");
    const closeBtn = document.getElementById('close-modal-btn')
    const cancelBtn = document.getElementById('cancel-btn')

    addBtn.addEventListener('click', () => modal.classList.add('open'))
    closeBtn.addEventListener('click', () => modal.classList.remove('open'))
    cancelBtn.addEventListener('click', () => modal.classList.remove('open'))
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open') })
}

const closeModal = () => {
    document.getElementById('add-class-modal').classList.remove('open')
    document.getElementById('add-class-form').reset()  // clear the form inputs
}

const createClassHandler = async () => {
    const form = document.getElementById("add-class-form")
    if (!form) return

    form.addEventListener('submit', async (e) => {        
            e.preventDefault();

        // get data from class form
        const className = document.querySelector(".class-name-input").value.trim();
        const classYear = document.querySelector(".class-year-input").value.trim();

        if (!className || !classYear) return;

        await fetchAndDisplay(`/api/classes`, { className, classYear });
    })
}

const fetchAndDisplay = async(url, classData) => {
    try {

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(classData)
        })

        if (!response.ok) {
            const result = await response.json();
            // showToast()
            return;
        }

        const result = await response.json();
        // showToast()
        console.log(result.classes);
        displayClass(result.classes);
        closeModal();

    } catch(error) {
        console.error(error);
        //showToast()
    }
}

const displayClass = (classes) => {
    const dashboardPage = document.querySelector(".dashboard-page");
    const statsRowContainer = dashboardPage.querySelector(".stats-row");
    const classesSession = document.querySelector(".classes-section");

    statsRowContainer.innerHTML = `<div class="stat-card">
            <span class="stat-number"> ${classes.length}</span>
            <span class="stat-label">Classes</span>
            </div>
            <div class="stat-card">
            <span class="stat-number">${classes.reduce((sum, c) => sum + Number(c.studentCount), 0)}</span>
            <span class="stat-label">Total Students</span>
            </div>`;

    if (classes.length == 0) {
        classesSession.innerHTML = `
            <h2>Your Classes</h2>
            <div class="empty-state">
                <p>No classes yet.</p>
                <p>Click <strong>New Class</strong> to get started.</p>
            </div>
        `
        return
    } 

    classesSession.innerHTML = `
        <h2>Your Classes</h2>
        <div class="classes-grid">
            ${classes.map(cls => `<a href="/classes/${cls.classSlug}" class="class-card">
                        <div class="class-card-top">
                            <span class="class-name">${cls.className}</span>
                            <span class="class-year">${cls.classYear}</span>
                        </div>
                        <div class="class-card-bottom">
                            <span class="student-count">${cls.studentCount} students</span>
                            <span class="class-arrow">→</span>
                        </div>
                    </a>`).join(' ')}
                    
        </div>
    `


}

export {addClassFormHander, createClassHandler};