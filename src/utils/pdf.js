const buildPdfHtml = (performance, reportContent) => {
    const ruleFollowingLabels = {
        1: 'Cần cải thiện nhiều',
        2: 'Đôi khi chưa tuân thủ',
        3: 'Thỉnh thoảng tuân thủ',
        4: 'Thường xuyên tuân thủ',
        5: 'Luôn luôn tuân thủ'
    }

    const examRows = performance.exams.map(e => `
        <tr>
            <td>${e.subject}</td>
            <td style="text-align:center">${e.score}/100</td>
        </tr>
    `).join('')

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 13pt;
            color: #1a1a1a;
            line-height: 1.6;
        }
        .page { padding: 0; }

        /* header */
        .doc-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; }
        .doc-header .school-name { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.05em; color: #444; }
        .doc-header h1 { font-size: 16pt; text-transform: uppercase; letter-spacing: 0.08em; margin: 8px 0 4px; }
        .doc-header .period { font-size: 12pt; color: #444; }

        /* student info */
        .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 20px; padding: 14px 16px; border: 1px solid #ccc; border-radius: 4px; background: #fafafa; }
        .info-row { display: flex; gap: 8px; font-size: 12pt; }
        .info-label { font-weight: bold; min-width: 100px; }

        /* section */
        .section { margin-bottom: 20px; }
        .section-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1a1a1a; padding-bottom: 4px; margin-bottom: 12px; }

        /* exam table */
        table { width: 100%; border-collapse: collapse; font-size: 12pt; }
        th { background: #2C3340; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
        td { padding: 7px 12px; border-bottom: 0.5px solid #e0e0e0; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) { background: #f9f9f9; }

        /* behavior */
        .behavior-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .behavior-item { padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 4px; }
        .behavior-label { font-size: 10pt; color: #666; margin-bottom: 3px; }
        .behavior-value { font-size: 13pt; font-weight: bold; color: #2C3340; }

        /* report text */
        .report-text { font-size: 12pt; line-height: 1.8; text-align: justify; white-space: pre-wrap; padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fafafa; }

        /* signature */
        .signature-section { margin-top: 32px; display: flex; justify-content: flex-end; }
        .signature-box { text-align: center; min-width: 200px; }
        .signature-date { font-size: 11pt; color: #444; margin-bottom: 48px; }
        .signature-line { border-top: 1px solid #1a1a1a; padding-top: 6px; font-weight: bold; font-size: 12pt; }
        .signature-name { font-size: 11pt; color: #444; margin-top: 4px; }
    </style>
</head>
<body>
<div class="page">

    <div class="doc-header">
        <p class="school-name">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
        <h1>Phiếu nhận xét học sinh</h1>
        <p class="period">${performance.periodLabel}</p>
    </div>

    <div class="student-info">
        <div class="info-row">
            <span class="info-label">Họ và tên:</span>
            <span>${performance.studentName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Lớp:</span>
            <span>${performance.className}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Giáo viên:</span>
            <span>${performance.teacherName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Năm học:</span>
            <span>${new Date().getFullYear()}-${new Date().getFullYear() + 1}</span>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Kết quả học tập</h2>
        <table>
            <thead>
                <tr>
                    <th>Môn học</th>
                    <th style="text-align:center">Điểm số</th>
                </tr>
            </thead>
            <tbody>
                ${examRows}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Hạnh kiểm</h2>
        <div class="behavior-grid">
            <div class="behavior-item">
                <div class="behavior-label">Chuyên cần</div>
                <div class="behavior-value">${performance.behavior.attendance}/${performance.behavior.totalDays} ngày</div>
            </div>
            <div class="behavior-item">
                <div class="behavior-label">Chấp hành nội quy</div>
                <div class="behavior-value">${ruleFollowingLabels[performance.behavior.ruleFollowing]}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Nhận xét của giáo viên</h2>
        <div class="report-text">${reportContent}</div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <p class="signature-date">Ngày _____ tháng _____ năm _____</p>
            <p class="signature-line">Giáo viên chủ nhiệm</p>
            <p class="signature-name">${performance.teacherName}</p>
        </div>
    </div>

</div>
</body>
</html>
    `
}

export { buildPdfHtml }