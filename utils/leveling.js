/**
 * 取得指定等級升級所需的經驗值
 * - 跨型態大關 (Lv.4, 9, 14): 需要 36 點 EXP
 * - 新手加速區 (Lv.0 ~ 3): 需要 6 點 EXP
 * - 其他換色小關: 需要 12 點 EXP
 * 
 * @param {number} level - 當前等級 (0 ~ 19)
 * @returns {number} 升級所需的經驗值
 */
export const getRequiredExp = (level) => {
  if (level === 4 || level === 9 || level === 14) {
    return 36;
  }
  if (level < 4) {
    return 6;
  }
  return 12;
};

/**
 * 檢查是否滿足升級條件，並計算溢出的經驗值與最終等級
 * 經驗值採累積制，若達到升級門檻則扣除該級所需經驗，剩餘經驗可繼續升級
 *
 * @param {number} currentLevel - 當前等級 (0 ~ 19)
 * @param {number} currentTotalExp - 當前持有的總經驗值 (包含當前獲得的經驗)
 * @returns {{ isLevelUp: boolean, nextLevel: number, remainingExp: number }} 升級判定結果
 */
export const checkLevelUp = (currentLevel, currentTotalExp) => {
  let nextLevel = currentLevel;
  let remainingExp = currentTotalExp;
  let isLevelUp = false;

  // 最高等級為 19
  const MAX_LEVEL = 19;

  while (nextLevel < MAX_LEVEL) {
    const requiredExp = getRequiredExp(nextLevel);
    
    // 如果經驗值足夠升級
    if (remainingExp >= requiredExp) {
      remainingExp -= requiredExp;
      nextLevel += 1;
      isLevelUp = true;
    } else {
      // 經驗值不足以升級，跳出迴圈
      break;
    }
  }

  // 確保等級不會超過 19
  if (nextLevel >= MAX_LEVEL) {
    nextLevel = MAX_LEVEL;
  }

  return {
    isLevelUp,
    nextLevel,
    remainingExp
  };
};

/**
 * 將等級轉換為對應的美術素材型態與顏色索引
 * - 型態 (tier): 每 5 級一個型態 (0: 趴趴兔, 1: 抓筆兔, 2: 認真兔, 3: 揮毫兔)
 * - 顏色 (colorIndex): 每個型態內的 5 個階段 (0 ~ 4)
 * 
 * @param {number} level - 當前等級 (0 ~ 19)
 * @returns {{ tier: number, colorIndex: number }} 素材的型態與顏色索引
 */
export const getRabbitAssetInfo = (level) => {
  // 保護機制：確保傳入的等級介於 0 到 19 之間
  const safeLevel = Math.max(0, Math.min(19, level));
  
  const tier = Math.floor(safeLevel / 5);
  const colorIndex = safeLevel % 5;
  
  return {
    tier,
    colorIndex
  };
};
