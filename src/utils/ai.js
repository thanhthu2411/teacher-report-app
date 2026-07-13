
const generateReport = async (prompt) => {
    // 1. Updated to the current gemini-2.5-flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    // 2. Clearer error handling for rate limits
    if (response.status === 429) {
        console.warn("⚠️ Hit Gemini API Rate Limit (429). Waiting a moment before trying again...");
        return null;
    }

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
        return data.candidates[0].content.parts[0].text;
};



const buildReportPrompt = (performance) => {
    const ruleFollowingLabels = {
        1: 'needs significant improvement in following classroom rules',
        2: 'sometimes struggles to follow classroom rules',
        3: 'follows classroom rules sometimes',
        4: 'follows classroom rules regularly',
        5: 'always follows classroom rules'
    }

    const examLines = performance.exams
        .map(e => `- ${e.subject}: ${e.score}/100${e.note ? ` (${e.note})` : ''}`)
        .join('\n')

    const noteLines = performance.notes.length > 0
        ? performance.notes.map(n => `- ${n.text}`).join('\n')
        : 'No additional notes'

    return `
        Write a progress report for a primary school student.

        Student: ${performance.studentName}
        Class: ${performance.className}
        Teacher: ${performance.teacherName}
        Period: ${performance.periodLabel}

        Academic Performance:
        ${examLines}

        Behavior:
        - Attendance: ${performance.behavior.attendance}/${performance.behavior.totalDays} days
        - Rule following: ${ruleFollowingLabels[performance.behavior.ruleFollowing]}

        Teacher Notes:
        ${noteLines}

        Instructions:
        - Write a warm, professional report (150-200 words) for parents
        - Write in Vietnamese
        - Highlight strengths first
        - Mention one area for improvement with a constructive suggestion
        - Avoid overly negative language
        - Address parents directly
    `
}

export { generateReport, buildReportPrompt }