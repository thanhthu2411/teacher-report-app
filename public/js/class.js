

const editClassFormHandler = () => {
    const editBtn = document.getElementById("edit-class-btn");
    if (!editBtn) return;

    const modal = document.querySelector(".edit-class-modal");
    const closeBtn = modal.querySelector(".modal-close-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    editBtn.addEventListener("click", () => {
        modal.classList.add('open');
        // console.log("hihi")
    });
    closeBtn.addEventListener('click', () => modal.classList.remove('open'))
    cancelBtn.addEventListener('click', () => modal.classList.remove('open'))
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open') })
    
}

const addStudentFormHandler = () => {
    const addBtn = document.getElementById("add-student-btn");
    if (!addBtn) return;
    const modal = document.querySelector(".add-student-modal");
    const closeBtn = modal.querySelector(".modal-close-btn");
    const cancelBtn = document.getElementById("cancel-student-btn");

    addBtn.addEventListener('click', () => modal.classList.add('open'))
    closeBtn.addEventListener('click', () => modal.classList.remove('open'))
    cancelBtn.addEventListener('click', () => modal.classList.remove('open'))
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open') })

}

const closeAddStudentModal = () => {
    document.querySelector(".add-student-modal").classList.remove('open');
    document.getElementById("add-student-form").reset();
}

const addStudentsHandler = async () => {
    const addStudentForm = document.getElementById("add-student-form");
    if (!addStudentForm) return;

    addStudentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById("student-name").value.trim();
        const dob = document.getElementById("student-dob").value;
        const gender = document.getElementById("student-gender").value;

        if (!name || !dob || !gender) return;

        // URL is: /classes/4a-2024-2025
        const pathParts = window.location.pathname.split('/')
        // ['', 'classes', '4a-2024-2025']
        const classSlug = pathParts[2]  // '4a-2024-2025'

        await fectchandDisplayStudents(`/api/classes/${classSlug}/students`, {name, dob, gender})
    })
}

const fectchandDisplayStudents = async (url, studentData) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(studentData)

        })

        if (!response.ok) {
            // const result = await response.json();
            return
        }

        const result = await response.json();
        displayStudents(result.students, result.cls);
        closeAddStudentModal();
    } catch(error) {
        console.error(error);
    }
}

const displayStudents = (students, cls) => {
    const studentNumContainer = document.getElementById("student-count");
    const studentsListContainer = document.querySelector(".students-section");

    studentNumContainer.innerText = students.length;

    if (students.length == 0) {
        studentsListContainer.innerHTML = `
            <h2>Students</h2>
            <div class="empty-state">
                <p>No students yet.</p>
                <p>Click <strong>New Student</strong> to get started.</p>
            </div>

        `
    } else {
        studentsListContainer.innerHTML = `
        <h2>Students</h2>
        <div class="student-list" id="student-list">
                    ${students.map((student, i) => 
                        `<div class="student-row">
                            <span class="student-index">${i+1}</span>
                            <span class="student-name">${student.studentName}</span>
                            <div class="student-actions">
                                <a href="/classes/${cls.slug}/students/${student.studentSlug}" 
                                class="view-btn">View →</a>
                            </div>
                        </div>`
                    
                    ).join(' ')}
                </div>`
    }
}

export {editClassFormHandler, addStudentFormHandler, addStudentsHandler}