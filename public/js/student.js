const addPerformanceFormHandler = () => {
  const addBtn = document.getElementById("add-performance-btn");
  if (!addBtn) return;

  const modal = document.getElementById("add-performance-modal");
  const cancelBtn = document.getElementById("cancel-performance-btn");
  const closeBtn = modal.querySelector(".modal-close-btn");

  addBtn.addEventListener("click", () => {
    modal.classList.add("open");
    console.log("hihi");
  });
  closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  cancelBtn.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
};

const closePerformanceModal = () => {
  document.getElementById("add-performance-modal").classList.remove("open");
  document.getElementById("add-performance-form").reset();
};

// add exam btn
const addExamHander = () => {
  const addBtn = document.getElementById("add-exam-btn");

  addBtn.addEventListener("click", () => {
    const examContainer = document.getElementById("exam-list");
    const newRow = document.createElement("div");
    newRow.className = "exam-row";
    newRow.innerHTML = `
            <input type="text" class="exam-subject" placeholder="Subject">
            <input type="number" class="exam-score" placeholder="Score">
            <input type="text" class="exam-note" placeholder="Note">
            <button type="button" class="remove-exam-btn">✕</button>
        `;
    examContainer.appendChild(newRow);
  });
};

const removeExamBtnHander = () => {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-exam-btn")) {
      e.target.closest(".exam-row").remove();
    }
  });
};
// add notes btn

const addNoteHandler = () => {
  document.getElementById("add-note-btn").addEventListener("click", () => {
    const noteList = document.getElementById("notes-list");
    const newRow = document.createElement("div");
    newRow.className = "note-row";
    newRow.innerHTML = `
            <textarea class="note-text" placeholder="Add a note..." rows="2"></textarea>
            <button type="button" class="remove-note-btn">✕</button>
        `;
    noteList.appendChild(newRow);
  });
};

const removeNoteBtnHandler = () => {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-note-btn")) {
      e.target.closest(".note-row").remove();
    }
  });
};

// handle submitting add performance form

const addPerformanceHandler = () => {
  const form = document.getElementById("add-performance-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. collect form data
    const periodLabel = document.getElementById("period").value;

    let exams = [];
    document.querySelectorAll(".exam-row").forEach((row) => {
      const subject = row.querySelector(".exam-subject").value.trim();
      const score = row.querySelector(".exam-score").value;
      const note = row.querySelector(".exam-note").value.trim();
      if (subject && score) {
        exams.push({ subject, score: Number(score), note: note || null });
      }
    });

    const behavior = {
      attendance: Number(document.getElementById("attendance").value),
      totalDays: Number(document.getElementById("total-days").value),
      ruleFollowing: Number(
        document.querySelector('input[name="ruleFollowing"]:checked')?.value,
      ),
    };

    let notes = [];
    document.querySelectorAll(".note-row").forEach((row) => {
      const text = row.querySelector(".note-text").value.trim();
      if (text) notes.push({ text });
    });

    // 2. basic validation
    if (!periodLabel) return;
    // showToast('Please select a period', 'error')
    if (exams.length === 0) return;
    // showToast('Please add at least one exam', 'error')
    if (
      !behavior.attendance ||
      !behavior.totalDays ||
      !behavior.ruleFollowing
    ) {
      return;
      // showToast('Please fill in all behavior fields', 'error')
    }

    // 3. send to server
    const studentSlug = window.location.pathname.split("/")[4];

    await fetchAndDisplayPerformance(
      `/api/students/${studentSlug}/performance`,
      {
        periodLabel,
        exams,
        behavior,
        notes,
      },
    );
  });
};

const fetchAndDisplayPerformance = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      console.log("Server error:", text);
      return;
    }

    const result = await response.json();
    displayPerformance(result.performances, result.student);
    closePerformanceModal();
  } catch (error) {
    console.error(error);
  }
};

const displayPerformance = (performances, student) => {
  const perContainer = document.querySelector(".performance-section");

  if (performances.length == 0) {
    perContainer.innerHTML = `
            <h2>Performance History</h2>
            <div class="empty-state">
                <p>No performance records yet.</p>
                <p>Click <strong>Add Performance</strong> to get started.</p>
            </div>
        `;
    return;
  }

  perContainer.innerHTML = `
            <h2>Performance History</h2>
            <div class="performance-list">
                ${performances
                  .map(
                    (perf) =>
                      `<div class="performance-card">
                            <div class="performance-card-header">
                                <h3>${perf.periodLabel}</h3>
                                <span class="performance-date">${new Date(perf.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div class="performance-details">
                                ${
                                  perf.exams && perf.exams.length > 0
                                    ? `<div class="exams-section">
                                        <h4>Exams</h4>
                                        ${perf.exams
                                          .map(
                                            (exam) => `<div class="exam-item">
                                                <span class="exam-subject">${exam.subject}</span>
                                                <span class="exam-score">${exam.score}/100</span>
                                                ${exam.note ? `<span class="exam-note">${exam.note}</span>` : ""}
                                            </div>`,
                                          )
                                          .join("")}
                                            
                                    </div>
                                    `
                                    : ""
                                }
                                
                                ${
                                  perf.behavior
                                    ? `<div class="behavior-section">
                                        <h4>Behavior</h4>
                                        <p>Attendance: ${perf.behavior.attendance}/${perf.behavior.totalDays} days</p>
                                        <p>Rule following: ${perf.behavior.ruleFollowing}/5</p>
                                    </div>`
                                    : ""
                                }

                                ${
                                  perf.notes && perf.notes.length > 0
                                    ? `
                                    <div class="notes-section">
                                        <h4>Notes</h4>
                                        ${perf.notes.map((note) => `<p class="note-item">${note.text}</p>`).join("")}
                                    </div>
                                    `
                                    : ""
                                }  
                            </div>

                            <button class="btn-primary generate-report-btn" 
                                    data-performance-id="${perf.performanceId}">
                                Generate Report
                            </button>

                            ${perf.report && perf.report.length > 0 ?
                                `<div class="report-section" id="report-${perf.performanceId}">
                                    <div class="report-content">
                                      <div class="report-header">
                                          <h4>Generated Report</h4>
                                          <span class="report-badge">AI Generated</span>
                                      </div>
                                      <textarea class="report-textarea" rows="10">${perf.report}</textarea>
                                      <p class="report-hint">You can edit this report before saving. Changes are not saved automatically.</p>
                                      <div class="report-actions">
                                          <div class="report-actions-left">
                                              <button class="btn-secondary regenerate-btn"
                                                      data-performance-id="${perf.performanceId}">
                                                  Regenerate
                                              </button>
                                              <button class="btn-primary save-report-btn"
                                                      data-performance-id="${perf.performanceId}">
                                                  Save Report
                                              </button>
                                              <button class="btn-primary export-report-btn"
                                                                data-performance-id="${perf.performanceId}">
                                                  Export Report as PDF
                                              </button>       
                                          </div>
                                          <span class="report-saved-label" id="saved-label-${perf.performanceId}">✓ Saved</span>
                                      </div>
                                    </div>
                                </div>` 
                              : `
                              <div class="report-section" id="report-${perf.performanceId}">
                                <div class="report-empty">
                                  <span class="report-empty-icon">📄</span>
                                  <p>No report yet. Click <strong>Generate Report</strong> to create one using AI.</p>
                                </div>
                              </div>`
                            }
                        </div>`,
                  )
                  .join(" ")}         
            </div>
   
    `;
};


// shared function — does the actual API call
const fetchGenerateReport = async (performanceId) => {
    const response = await fetch(`/api/performance/${performanceId}/report`, {
        method: 'POST',
        credentials: 'include'
    })


    if (!response.ok) {
        // showToast(result.message, 'error')
        return
    }

    const result = await response.json()

    displayReport(result.performance, result.report)
    // showToast(result.message)
}

// *** GENERATING REPORT ***
const generateReportHandler = () => {
    document.addEventListener('click', async (e) => {
        const generateBtn = e.target.closest('.generate-report-btn')
        if (!generateBtn) return

        const performanceId = generateBtn.dataset.performanceId
        generateBtn.textContent = 'Generating...'
        generateBtn.disabled = true

        try {
            await fetchGenerateReport(performanceId)  // ← calls shared function
        } catch (error) {
            // showToast('Failed to generate report', 'error')
            console.error(error)
        } finally {
            generateBtn.textContent = 'Generate Report'
            generateBtn.disabled = false
        }
    })
}



const displayReport = (perf, report) => {
    const reportContainer = document.querySelector(".report-section")
    
    if(!report) {
      reportContainer.innerHTML = `<div class="report-empty">
                                        <span class="report-empty-icon">📄</span>
                                        <p>No report yet. Click <strong>Generate Report</strong> to create one using AI.</p>
                                    </div>`
      return;
    }

    reportContainer.innerHTML = `
      <div class="report-content">
          <div class="report-header">
              <h4>Generated Report</h4>
              <span class="report-badge">AI Generated</span>
          </div>
          <textarea class="report-textarea" rows="10">${report}</textarea>
          <p class="report-hint">You can edit this report before saving. Changes are not saved automatically.</p>
          <div class="report-actions">
              <div class="report-actions-left">
                  <button class="btn-secondary regenerate-btn"
                          data-performance-id="${perf.performanceId}">
                      Regenerate
                  </button>
                  <button class="btn-primary save-report-btn"
                          data-performance-id="${perf.performanceId}">
                      Save Report
                  </button>
                  <button class="btn-primary export-report-btn"
                        data-performance-id="${perf.performanceId}">
                    Export Report as PDF
                </button>
              </div>
              <span class="report-saved-label" id="saved-label-${perf.performanceId}">✓ Saved</span>
          </div>
      </div>
    `
};

// *** SAVE REPORT HANDLER ***
const saveReportHander = () => {
  document.addEventListener("click", async (e) => {
    const saveBtn = e.target.closest(".save-report-btn");
    if (!saveBtn) return

    const performanceId = saveBtn.dataset.performanceId
    const reportSection = document.getElementById(`report-${performanceId}`)
    const content = reportSection.querySelector('.report-textarea').value.trim()

    try {

      const response = await fetch(`/api/performance/${performanceId}/report/save`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if(!response.ok) {
        // showToast()
        return
      }

      const result = await response.json()

      const savedLabel = document.getElementById(`saved-label-${performanceId}`)
      if (savedLabel) {
        savedLabel.classList.add('visible')
        setTimeout(() => savedLabel.classList.remove('visible'), 3000)
      }

      // showToast()

    } catch(error) {
      // showToast
        console.error(error)
    }
  })
}

// *** REGENERATE REPORT HANDLER ***
const regenerateReportHandler = () => {
    document.addEventListener('click', async (e) => {
        const regenerateBtn = e.target.closest('.regenerate-btn')
        if (!regenerateBtn) return

        const performanceId = regenerateBtn.dataset.performanceId
        regenerateBtn.textContent = 'Regenerating...'
        regenerateBtn.disabled = true

        try {
            await fetchGenerateReport(performanceId)  // ← same shared function
            // showToast('Report regenerated — click Save to keep it')
        } catch (error) {
            // showToast('Failed to regenerate report', 'error')
            console.error(error)
        } finally {
            regenerateBtn.textContent = 'Regenerate'
            regenerateBtn.disabled = false
        }
    })
}

// *** EXPORT REPORT HANDLER ***
const exportReportHandler = () => {
  document.addEventListener("click", async (e) => {
        const exportBtn = e.target.closest(".export-report-btn")
        if (!exportBtn) return

        const performanceId = exportBtn.dataset.performanceId
        exportBtn.textContent = 'Exporting...'
        exportBtn.disabled = true

        try {
            const response = await fetch(`/api/performance/${performanceId}/report/export`, {
              method: "POST",
              credentials: 'include'
            })

            const contentType = response.headers.get('content-type')
            // console.log('content-type:', contentType)

            if (!response.ok || !contentType.includes('application/pdf')) {
                const text = await response.text()
                console.log('server response:', text)
                return
            }

            //get response's raw binary data, convert bytes to Blob object 
            const blob = await response.blob()
            // Creates a temporary URL in the browser's memory that points to your blob
            const url = URL.createObjectURL(blob)

            const aLink = document.createElement('a')
            aLink.href = url
            // The download attribute tells the browser "when this link is clicked, download the file with this name" instead of navigating to it.
            aLink.download = `report-${performanceId}.pdf`
            //clicks the invisible link — triggers the browser's download dialog exactly as if the user clicked a download link themselves.
            aLink.click()
            //Cleans up memory — releases the temporary blob URL
            URL.revokeObjectURL(url)

        } catch(error) {
          console.error(error)
        } finally {
            exportBtn.textContent = 'Export PDF'
            exportBtn.disabled = false
        }
    })
}

// Teacher clicks "Export PDF"
//     ↓
// fetch() sends POST to /api/performance/12/report/export
//     ↓
// Server generates PDF bytes and sends back
//     ↓
// response.blob() reads those bytes
//     ↓
// URL.createObjectURL() creates temporary link
//     ↓
// invisible <a> click triggers download
//     ↓
// browser saves "report-12.pdf" to Downloads folder
//     ↓
// URL.revokeObjectURL() cleans up memory


export {
  addPerformanceFormHandler,
  addExamHander,
  removeExamBtnHander,
  addNoteHandler,
  removeNoteBtnHandler,
  addPerformanceHandler,
  generateReportHandler,
  saveReportHander,
  regenerateReportHandler,
  exportReportHandler
};
