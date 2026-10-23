// GPA 計算器邏輯

(function() {
  const GRADE_SCALES = {
    '4.3': { 'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 },
    '4.0': { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 }
  };

  const DEFAULT_COURSES = [
    { name: '微積分 (一)', credits: 3, grade: 'A' },
    { name: '計算機概論', credits: 3, grade: 'A+' },
    { name: '經濟學原理', credits: 3, grade: 'A-' },
    { name: '商用英文溝通', credits: 2, grade: 'A' },
    { name: '程式設計導論', credits: 3, grade: 'A+' },
    { name: '體育 (羽球)', credits: 1, grade: 'A' }
  ];

  let courses = [...DEFAULT_COURSES];

  const gpaScaleSelect = document.getElementById('gpa-scale');
  const btnAddCourse = document.getElementById('btn-add-course');
  const btnSample = document.getElementById('btn-sample');
  const courseRows = document.getElementById('course-rows');
  const gpaResultEl = document.getElementById('gpa-result');
  const totalPointsEl = document.getElementById('total-points');
  const totalCreditsEl = document.getElementById('total-credits');
  const avgCoursePointEl = document.getElementById('avg-course-point');

  function calculate() {
    const scale = gpaScaleSelect.value;
    const gradeMap = GRADE_SCALES[scale];

    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach(c => {
      const cr = parseFloat(c.credits) || 0;
      const pt = gradeMap[c.grade] !== undefined ? gradeMap[c.grade] : 0;
      totalCredits += cr;
      totalPoints += (cr * pt);
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    gpaResultEl.textContent = gpa;
    totalPointsEl.textContent = totalPoints.toFixed(1);
    totalCreditsEl.textContent = `${totalCredits} 學分`;
    avgCoursePointEl.textContent = courses.length > 0 ? (totalPoints / courses.length).toFixed(2) : '0.00';
  }

  function renderTable() {
    courseRows.innerHTML = '';
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

    courses.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom: 1px solid var(--color-border);';

      const optionsHtml = grades.map(g => `<option value="${g}" ${g === c.grade ? 'selected' : ''}>${g}</option>`).join('');

      tr.innerHTML = `
        <td style="padding: 6px 8px;">
          <input type="text" class="form-input c-name" value="${c.name}" placeholder="課程名稱" style="padding: 4px 8px;">
        </td>
        <td style="padding: 6px 8px;">
          <input type="number" class="form-input c-credits" value="${c.credits}" min="0" max="10" step="0.5" style="padding: 4px 8px;">
        </td>
        <td style="padding: 6px 8px;">
          <select class="form-input c-grade" style="padding: 4px 8px; font-weight: 700;">
            ${optionsHtml}
          </select>
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <button class="btn btn--xs btn--ghost btn-del-c" style="color: var(--color-danger); padding: 4px 8px;">✕</button>
        </td>
      `;

      tr.querySelector('.c-name').addEventListener('input', (e) => {
        c.name = e.target.value;
      });
      tr.querySelector('.c-credits').addEventListener('input', (e) => {
        c.credits = parseFloat(e.target.value) || 0;
        calculate();
      });
      tr.querySelector('.c-grade').addEventListener('change', (e) => {
        c.grade = e.target.value;
        calculate();
      });
      tr.querySelector('.btn-del-c').addEventListener('click', () => {
        courses.splice(idx, 1);
        renderTable();
        calculate();
      });

      courseRows.appendChild(tr);
    });
  }

  btnAddCourse.addEventListener('click', () => {
    courses.push({ name: `科目 ${courses.length + 1}`, credits: 3, grade: 'A' });
    renderTable();
    calculate();
  });

  btnSample.addEventListener('click', () => {
    courses = JSON.parse(JSON.stringify(DEFAULT_COURSES));
    renderTable();
    calculate();
  });

  gpaScaleSelect.addEventListener('change', calculate);

  renderTable();
  calculate();
})();
