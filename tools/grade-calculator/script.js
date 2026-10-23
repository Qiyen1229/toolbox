// 期末及格與目標成績倒推試算邏輯（含期中考權重）

(function() {
  const targetGradeInput = document.getElementById('target-grade');
  const regularScoreInput = document.getElementById('regular-score');
  const regularWeightInput = document.getElementById('regular-weight');
  const midtermScoreInput = document.getElementById('midterm-score');
  const midtermWeightInput = document.getElementById('midterm-weight');
  const finalWeightInput = document.getElementById('final-weight');

  const neededScoreDisplay = document.getElementById('needed-score-display');
  const difficultyStatus = document.getElementById('difficulty-status');
  const regularContribEl = document.getElementById('regular-contrib');
  const midtermContribEl = document.getElementById('midterm-contrib');
  const currentTotalContribEl = document.getElementById('current-total-contrib');
  const totalWeightIndicator = document.getElementById('total-weight-indicator');
  const adviceBox = document.getElementById('advice-box');
  const targetPresetBtns = document.querySelectorAll('.btn-target-preset');

  function calculate() {
    const target = parseFloat(targetGradeInput.value) || 0;
    const regScore = parseFloat(regularScoreInput.value) || 0;
    const regWeight = parseFloat(regularWeightInput.value) || 0;
    const midScore = parseFloat(midtermScoreInput.value) || 0;
    const midWeight = parseFloat(midtermWeightInput.value) || 0;
    const finalWeight = parseFloat(finalWeightInput.value) || 0;

    const totalWeight = regWeight + midWeight + finalWeight;
    totalWeightIndicator.textContent = `${totalWeight}%`;
    if (Math.abs(totalWeight - 100) < 0.01) {
      totalWeightIndicator.style.color = 'var(--color-success)';
    } else {
      totalWeightIndicator.style.color = 'var(--color-warning)';
    }

    const regContrib = regScore * (regWeight / 100);
    const midContrib = midScore * (midWeight / 100);
    const currentTotalContrib = regContrib + midContrib;

    regularContribEl.textContent = `${regContrib.toFixed(1)} 分`;
    midtermContribEl.textContent = `${midContrib.toFixed(1)} 分`;
    currentTotalContribEl.textContent = `${currentTotalContrib.toFixed(1)} 分`;

    if (finalWeight <= 0) {
      neededScoreDisplay.textContent = '期末權重不可為 0';
      difficultyStatus.textContent = '請填寫期末權重';
      return;
    }

    const neededContribution = target - currentTotalContrib;
    const neededRaw = neededContribution / (finalWeight / 100);
    const neededFormatted = neededRaw.toFixed(1);

    if (neededRaw <= 0) {
      neededScoreDisplay.textContent = '0 分 (已提前達標)';
      neededScoreDisplay.style.color = 'var(--color-success)';
      difficultyStatus.textContent = '🎉 提早達標';
      difficultyStatus.style.color = 'var(--color-success)';
      adviceBox.innerHTML = `恭喜！目前平時與期中已累計 <strong>${currentTotalContrib.toFixed(1)} 分</strong>，已直接達到或超越目標總分 <strong>${target} 分</strong>，期末考就算 0 分也保證及格過關！`;
    } else if (neededRaw <= 60) {
      neededScoreDisplay.textContent = `${neededFormatted} 分`;
      neededScoreDisplay.style.color = 'var(--color-success)';
      difficultyStatus.textContent = '✓ 輕鬆過關';
      difficultyStatus.style.color = 'var(--color-success)';
      adviceBox.innerHTML = `期末考只需拿到 <strong>${neededFormatted} 分</strong>（及格線以下）即可達到目標 <strong>${target} 分</strong>，考前保持正常發揮即可穩穩拿下！`;
    } else if (neededRaw <= 85) {
      neededScoreDisplay.textContent = `${neededFormatted} 分`;
      neededScoreDisplay.style.color = 'var(--color-accent)';
      difficultyStatus.textContent = '💪 穩健努力可達成';
      difficultyStatus.style.color = 'var(--color-accent)';
      adviceBox.innerHTML = `期末考需要考到 <strong>${neededFormatted} 分</strong>，考前建議安排 2~3 天專注複習期末重點題型與考古題，很有機會達標！`;
    } else if (neededRaw <= 100) {
      neededScoreDisplay.textContent = `${neededFormatted} 分`;
      neededScoreDisplay.style.color = 'var(--color-warning)';
      difficultyStatus.textContent = '🔥 需全力衝刺';
      difficultyStatus.style.color = 'var(--color-warning)';
      adviceBox.innerHTML = `挑戰度較高！期末考必須考到 <strong>${neededFormatted} 分</strong> 以上，建議立刻啟動番茄鐘進入高強度刷題衝刺模式！`;
    } else {
      const maxPossible = currentTotalContrib + (100 * (finalWeight / 100));
      neededScoreDisplay.textContent = `${neededFormatted} 分`;
      neededScoreDisplay.style.color = 'var(--color-danger)';
      difficultyStatus.textContent = '⚠️ 就算滿分亦無法達標';
      difficultyStatus.style.color = 'var(--color-danger)';
      adviceBox.innerHTML = `殘酷警訊：即使期末考拿到 <strong>100 分滿分</strong>，學期總成績最高也僅有 <strong>${maxPossible.toFixed(1)} 分</strong>。建議盡速與授課教授聯繫，詢問是否有額外加分作業或補救專案！`;
    }
  }

  targetPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      targetGradeInput.value = btn.dataset.val;
      calculate();
    });
  });

  [targetGradeInput, regularScoreInput, regularWeightInput, midtermScoreInput, midtermWeightInput, finalWeightInput].forEach(el => {
    el.addEventListener('input', calculate);
  });

  calculate();
})();
