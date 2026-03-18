/**
 * Bilingual labels for Diagnosis steps (English / 한국어).
 * Use for section titles, form labels, callouts, and buttons.
 */
export const t = {
  // Common
  back: { en: 'Back', ko: '이전' },
  next: { en: 'Next', ko: '다음' },
  saving: { en: 'Saving...', ko: '저장 중...' },
  saved: { en: 'Saved', ko: '저장됨' },
  savedDesc: { en: 'Your changes have been saved successfully.', ko: '변경 사항이 저장되었습니다.' },
  proceeding: { en: 'Proceeding to next step.', ko: '다음 단계로 이동합니다.' },
  completeRequired: { en: 'Complete required fields to continue', ko: '필수 항목을 입력한 후 진행해 주세요.' },
  validationError: { en: 'Validation error', ko: '입력 오류' },
  saveFailed: { en: 'Save failed', ko: '저장 실패' },

  // Leaders
  leadersTitle: { en: 'Leaders (Excluding Executives)', ko: '리더 (임원 제외)' },
  leadersNote: {
    en: 'Note: Leaders are defined as employees above Team Leader level. This excludes executives.',
    ko: '리더는 팀장급 이상 직원을 의미하며, 임원은 제외됩니다.',
  },
  totalLeaders: { en: 'Total Leaders (Above Team Leader)', ko: '팀장급 이상 리더 수' },
  leadersRatio: { en: 'Leaders Ratio (Auto-calculated)', ko: '리더 비율 (자동 계산)' },
  leadersWorkforce: { en: 'leaders / workforce', ko: '리더 / 전체 인원' },
  leadersCountLabel: { en: 'leaders', ko: '리더' },
  workforceCountLabel: { en: 'workforce', ko: '전체 인원' },

  // Job Grades
  jobGradeSystem: { en: 'Job Grade System', ko: '직급 체계' },
  jobGradeDesc: {
    en: 'Enter grade name, standard promotion period, headcount per grade, and expected role. Draft expected roles are provided and can be freely modified.',
    ko: '직급명, 표준 승격 기간, 직급별 인원 수, 기대역할을 입력하세요. 기대역할은 초안이 제공되며 자유롭게 수정할 수 있습니다.',
  },
  expectedRoleDraft: {
    en: 'Draft expected roles provided: The expected role for each grade is pre-written based on consulting standards. Please modify freely to suit your company\'s culture and context.',
    ko: '기대역할 초안 제공: 각 직급의 기대역할은 컨설팅 표준안을 기반으로 미리 작성되어 있습니다. 귀사의 문화와 맥락에 맞게 자유롭게 수정해 주세요.',
  },
  gradeNamesCard: {
    en: 'Grade Names, Promotion Duration & Expected Role',
    ko: '직급명, 승격 기간, 기대역할',
  },
  gradeNamesSub: {
    en: 'Grade names and promotion duration are editable; modifying the expected role text will save it.',
    ko: '직급명과 승격 기간은 편집 가능하며, 기대역할 텍스트를 수정하면 저장됩니다.',
  },
  addGrade: { en: 'Add Grade', ko: '직급 추가' },
  gradeName: { en: 'Grade Name', ko: '직급명' },
  promotionPeriod: { en: 'Promotion Period', ko: '승격 기간' },
  years: { en: 'years', ko: '년' },
  noFixedPeriod: { en: 'No fixed period', ko: '기간 없음' },
  headcount: { en: 'Headcount', ko: '인원 수' },
  persons: { en: 'persons', ko: '명' },
  expectedRoleCompetencies: { en: 'Expected Role & Competencies', ko: '기대역할 및 역량' },
  expectedRolePlaceholder: {
    en: 'Enter the expected role and key competencies for this grade.',
    ko: '이 직급의 기대역할과 핵심 역량을 입력하세요.',
  },
  totalHeadcount: { en: 'Total Headcount', ko: '합산 인원' },
  workforceMatch: {
    en: 'Total headcount matches workforce count.',
    ko: '합산 인원이 전체 인원과 일치합니다.',
  },
  workforceOver: {
    en: 'Total headcount exceeds workforce. Adjust headcount per grade.',
    ko: '합산 인원이 전체 인원보다 초과합니다. 직급별 인원을 조정해 주세요.',
  },
  workforceUnder: {
    en: 'Total headcount is less than workforce. Adjust headcount per grade.',
    ko: '합산 인원이 전체 인원보다 부족합니다. 직급별 인원을 조정해 주세요.',
  },
  excess: { en: 'over', ko: '명 초과' },
  short: { en: 'short', ko: '명 부족' },
  adjustGrades: { en: 'Adjust headcount per grade.', ko: '직급별 인원을 조정해 주세요.' },

  // Org Charts
  orgChartTitle: { en: 'Organizational Chart', ko: '조직도' },
  orgChartDesc: {
    en: 'Upload organizational charts for the last 3 years. The flow of organizational changes is a key basis for HR system design.',
    ko: '최근 3년간의 조직도를 업로드하세요. 조직 변화 흐름이 HR 시스템 설계의 핵심 근거가 됩니다.',
  },
  required: { en: '* Required', ko: '* 필수' },
  uploadComplete: { en: 'Upload complete', ko: '업로드 완료' },
  uploadRequired: { en: 'Upload required', ko: '업로드 필요' },
  uploadPending: { en: 'Upload pending', ko: '업로드 대기' },
  clickOrDrag: { en: 'Click or drag to upload', ko: '클릭 또는 드래그하여 업로드' },
  currentOrgChart: { en: 'Current (latest) org chart', ko: '현재(최신) 기준 조직도' },
  preview: { en: 'Preview', ko: '미리보기' },
  delete: { en: 'Delete', ko: '삭제' },
  complete: { en: 'complete', ko: '완료' },

  // Org Structure
  orgStructureTitle: { en: 'Organizational Structure', ko: '조직 구조' },
  orgStructureDesc: {
    en: 'Select all organizational structures that apply to your company. Multiple selection is allowed and forms the basis for performance and compensation design.',
    ko: '귀사의 조직 구조를 모두 선택하세요. 복수 선택이 가능하며, 성과 평가와 보상 체계 설계의 핵심 기반이 됩니다.',
  },
  customOrgTitle: {
    en: 'Does your company have unique organizational characteristics?',
    ko: '우리 회사만의 조직 특성이 있나요?',
  },
  customOrgSub: {
    en: 'If you have structures or practices that are hard to describe with the types above, please describe them.',
    ko: '위 유형으로 설명하기 어려운 구조나 운영 방식이 있다면 자유롭게 설명해 주세요.',
  },
  customOrgPlaceholder: {
    en: 'e.g. Joint venture with external partners; internally operated in cell units.',
    ko: '예) 외부 파트너사와 공동 운영하는 조인트 벤처 형태이며, 내부적으로는 셀(Cell) 단위로 자율 운영됩니다.',
  },
  selectedStructures: { en: 'Selected Structures', ko: '선택된 구조' },
  noStructureSelected: { en: 'No organizational structure selected', ko: '선택된 조직 구조가 없습니다' },

  // Job Structure
  jobStructureTitle: { en: 'Job Structure', ko: '직무 구조' },
  jobStructureDesc: {
    en: 'Select a job category from the left, and manage job functions from the right.',
    ko: '왼쪽에서 직군(Category)을 선택하고, 오른쪽에서 직무(Function)를 관리하세요.',
  },
  jobCategoryList: { en: 'Job Category List', ko: '직군 목록' },
  addCategory: { en: '+ Add', ko: '+ 추가' },
  functionsCount: { en: 'functions', ko: '직무' },
  functionsCountSuffix: { en: 'functions', ko: '개' },
  addCategoryPlaceholder: { en: 'Enter category name…', ko: '직군명 입력…' },
  confirm: { en: 'Confirm', ko: '확인' },
  cancel: { en: 'Cancel', ko: '취소' },
  addCategoryEmpty: { en: 'Add a category to get started', ko: '직군을 추가해보세요' },
  addFunctionPlaceholder: { en: "Enter functions belonging to '{{name}}'", ko: "'{{name}}' 에 속하는 직무 입력…" },
  addFunctionBtn: { en: '+ Add Function', ko: '+ 직무 추가' },
  addFunctionBelow: { en: 'Add functions below', ko: '아래에서 직무를 추가하세요' },
  selectCategoryLeft: { en: 'Select a category from the left', ko: '왼쪽에서 직군을 선택하세요' },

  // HR Issues
  hrIssuesTitle: { en: 'Key HR / Organizational Issues', ko: '핵심 HR·조직 이슈' },
  hrIssuesDesc: {
    en: 'Select the HR issues you are currently experiencing in your organization. You can skip if none apply.',
    ko: '현재 조직에서 체감하는 HR 이슈를 선택하세요. 해당되는 항목이 없으면 넘어가도 됩니다.',
  },
  totalItems: { en: 'Total items', ko: '총' },
  itemsSuffix: { en: 'items', ko: '개 항목' },
  selectedCount: { en: 'selected', ko: '개 선택됨' },
  directInput: { en: 'Direct input', ko: '직접 입력' },
  customIssuePlaceholder: { en: 'Enter any HR issues not listed above…', ko: '위 항목에 없는 HR 이슈를 자유롭게 입력하세요…' },
  prevCategory: { en: '← Previous category', ko: '← 이전 카테고리' },
  nextCategory: { en: 'Next category →', ko: '다음 카테고리 →' },
  totalSelectedIssues: { en: 'Total issues selected', ko: '선택된 이슈 총' },
  issuesSuffix: { en: 'issues', ko: '개' },

  // Review & Submit dashboard
  reviewDashboardTitle: { en: 'Review & Submit Diagnosis', ko: '조직속성 진단 대시보드' },
  reviewDashboardDesc: {
    en: 'Review the entered content and submit if everything looks correct. You can edit by hovering over the cards.',
    ko: '입력한 내용을 검토하고 이상이 없으면 제출하세요. 카드에 마우스를 올리면 수정할 수 있습니다.',
  },
  totalShort: { en: 'total', ko: '전체' },
  activeTenure: { en: 'Avg. tenure (active)', ko: '재직자 평균 근속' },
  exitTenure: { en: 'Avg. tenure (leavers)', ko: '퇴직자 평균 근속' },
  leaderRatioLabel: { en: 'Leader ratio (managers + executives)', ko: '리더 비중 (관리자+임원)' },
  executiveRatioLabel: { en: 'Executive ratio', ko: '임원 비중' },
  personsUnit: { en: 'persons', ko: '명' },
  yearsUnit: { en: 'years', ko: '년' },
  genderDistribution: { en: 'Gender distribution', ko: '성별 분포' },
  male: { en: 'Male', ko: '남성' },
  female: { en: 'Female', ko: '여성' },
  other: { en: 'Other', ko: '기타' },
  jobCategoriesCount: { en: 'Job categories', ko: '직군' },
  jobFunctionsCount: { en: 'Job functions', ko: '직무' },
  companyCardTitle: { en: 'Company', ko: 'Company' },
  workforceCardTitle: { en: 'Workforce', ko: 'Workforce' },
  gradePyramidTitle: { en: 'Headcount by job grade', ko: '직급별 인원 분포' },
  currentOrgChartTitle: { en: 'Current org chart', ko: '현재 조직도' },
  orgStructureCardTitle: { en: 'Org Structure', ko: 'Org Structure' },
  hrIssuesCardTitle: { en: 'Key HR issues', ko: '당면 HR 이슈' },
  foundedDate: { en: 'Founded', ko: '설립일' },
  size: { en: 'Size', ko: '규모' },
  industry: { en: 'Industry', ko: '업종' },
  listedStatus: { en: 'Listed', ko: '상장여부' },
  hqLocation: { en: 'HQ location', ko: '본사 위치' },
  brandName: { en: 'Brand name', ko: '브랜드명' },
  registrationNumber: { en: 'Registration no.', ko: '사업자등록번호' },
  fullTime: { en: 'Full-time', ko: '정규직' },
  partTime: { en: 'Part-time', ko: '파트타임' },
  contractors: { en: 'Contractors', ko: '계약직' },
  avgAge: { en: 'Avg. age', ko: '평균 연령' },
  ageUnit: { en: 'years', ko: '세' },
  pyramidHealthy: { en: 'Healthy pyramid ▽', ko: '정피라미드 ▽' },
  pyramidHealthyDesc: {
    en: 'Healthy structure — lower grades are thick and promotion pipeline is stable.',
    ko: '건강한 구조 — 하위 직급이 두텁고 승진 파이프라인이 안정적입니다.',
  },
  pyramidInverted: { en: 'Inverted pyramid △', ko: '역피라미드 △' },
  pyramidInvertedDesc: {
    en: 'Top-heavy — need to fill lower grades and review pipeline.',
    ko: '고위직 쏠림 — 하위 직급 충원 및 파이프라인 점검이 필요합니다.',
  },
  pyramidDiamond: { en: 'Diamond ◇', ko: '다이아몬드 ◇' },
  pyramidDiamondDesc: {
    en: 'Mid-level concentration — review balance of upper and lower grades.',
    ko: '중간 직급 집중 — 상·하위 직급 균형을 검토해 보세요.',
  },
  orgChartUploadHint: { en: 'Upload org chart image', ko: '조직도 이미지 업로드' },
  orgChartUploadDesc: {
    en: 'The org chart uploaded in the Org Charts step will be displayed here.',
    ko: 'Org Charts 단계에서 업로드한 조직도가 여기 표시됩니다',
  },
  goToPrevStep: { en: 'Go to previous step →', ko: '이전 단계로 이동 →' },
  selectedOrgTypes: { en: 'Selected structure type(s)', ko: '선택된 조직 구조 유형' },
  editBtn: { en: 'Edit', ko: '수정' },
  submitConfirmTitle: { en: 'Have you checked all contents?', ko: '모든 내용을 확인하셨나요?' },
  submitConfirmDesc: {
    en: 'The consultant will start writing the report.',
    ko: '컨설턴트가 리포트 작성을 시작합니다.',
  },
  reviewDashboardDescShort: {
    en: 'Review the entered content and submit it.',
    ko: '입력한 내용을 검토하고 제출하세요.',
  },
  listedShort: { en: 'Listed', ko: '상장' },
  sector: { en: 'Industry', ko: '업종' },
  avgAgeShort: { en: 'Avg. age', ko: '평균연령' },
  avgTenureShort: { en: 'Avg. tenure', ko: '평균 근속' },
  gradeDistributionTitle: { en: 'Job grade distribution', ko: '직급별 분포' },
  currentIssuesTitle: { en: 'Current issues', ko: '당면 이슈' },
  submitDiagnosisBtn: { en: 'Submit Diagnosis →', ko: '진단 제출하기 →' },
  backBtn: { en: '← Back', ko: '← 이전' },
  itemsCount: { en: 'items', ko: '건' },
  expectedHeadcount1y: { en: 'Expected (1 yr)', ko: '1년 후 예상' },
  expectedHeadcount2y: { en: 'Expected (2 yr)', ko: '2년 후 예상' },
  expectedHeadcount3y: { en: 'Expected (3 yr)', ko: '3년 후 예상' },

  // Workforce
  workforcePageTitle: { en: 'Current Workforce', ko: '현재 인력 현황' },
  workforceHeroTitle: { en: 'Workforce Overview', ko: '현재 인력 현황' },
  workforceHeroDesc: { en: 'Enter total headcount and gender composition.', ko: '현재 재직 중인 전체 인원과 성별 구성을 입력하세요' },
  totalEmployees: { en: 'Total Employees', ko: '총 재직 인원' },
  presentHeadcountTitle: { en: 'Present headcount', ko: '전체 재직 인원' },
  genderCompositionTitle: { en: 'Gender composition', ko: '성별 구성' },
  maleWithEn: { en: 'Male', ko: '남성 (Male)' },
  femaleWithEn: { en: 'Female', ko: '여성 (Female)' },
  ratioMale: { en: '{{pct}}% male', ko: '{{pct}}% 남성' },
  ratioFemale: { en: '{{pct}}% female', ko: '{{pct}}% 여성' },
  ratioText: { en: 'Ratio {{m}}:{{f}}', ko: '비율 {{m}}:{{f}}' },
  genderMismatchWarn: { en: 'Male + Female total does not match present headcount.', ko: '남성+여성 합계가 전체 재직 인원과 다릅니다' },
  includeAllHint: { en: '* Include full-time, contract, and dispatched employees.', ko: '* 정규직·계약직·파견직 모두 포함한 실제 재직자 수' },
  avgTenureActiveLabel: { en: 'Avg. tenure (active)', ko: '평균 근속 (재직자)' },
  avgTenureLeaversLabel: { en: 'Avg. tenure (leavers)', ko: '평균 근속 (퇴직자)' },
  avgAgeLabel: { en: 'Avg. age', ko: '평균 연령' },
  unitYrShort: { en: 'yr', ko: '년' },
  forecastSectionLabel: { en: 'Workforce forecast', ko: '예상 인력 규모' },
  forecastCardTitle: { en: 'Workforce Forecast', ko: '향후 인력 규모' },
  forecastCardDesc: { en: 'Enter expected headcount for the next 1–3 years.', ko: '향후 1-3년 예상 재직 인원을 입력하세요' },
  after1y: { en: 'After 1 year', ko: '1년 후' },
  after2y: { en: 'After 2 years', ko: '2년 후' },
  after3y: { en: 'After 3 years', ko: '3년 후' },

  // Company Info
  companyInfoPageTitle: { en: 'Company Basic Information', ko: '회사 기본 정보' },
  companyInfoHeroTitle: { en: 'Company Basic Information', ko: '회사 기본 정보' },
  companyInfoHeroDesc: { en: 'Enter company identification, industry, and HQ location.', ko: '회사 식별 정보, 산업, 위치 정보를 입력하세요.' },
  companyIdentitySection: { en: 'Company identification', ko: '회사 식별 정보' },
  companyNameLabel: { en: 'Company name', ko: '회사명' },
  companyNamePlaceholder: { en: 'Better Company', ko: 'Better Company' },
  registrationNumberLabel: { en: 'Registration number', ko: '사업자등록번호' },
  registrationNumberFormatHint: { en: 'Format: 000-00-00000', ko: '형식: 000-00-00000' },
  brandNameLabel: { en: 'Brand name', ko: '브랜드명' },
  foundationDateLabel: { en: 'Foundation date', ko: '설립일' },
  publicListingLabel: { en: 'Public listing', ko: '상장 여부' },
  listedLabel: { en: 'Listed', ko: '상장' },
  privateLabel: { en: 'Private', ko: '비상장' },
  industryLocationSection: { en: 'Industry & location', ko: '산업 및 위치' },
  primaryIndustryLabel: { en: 'Primary industry', ko: '주요 산업' },
  primaryIndustryPlaceholder: { en: 'Services', ko: '서비스' },
  othersLabel: { en: 'Others', ko: '기타' },
  specifyPlaceholder: { en: 'Please specify', ko: '직접 입력' },
  subIndustryLabel: { en: 'Sub industry category', ko: '세부 산업' },
  subIndustryPlaceholder: { en: 'Professional Services', ko: '전문 서비스' },
  hqLocationLabel: { en: 'HQ location', ko: '본사 위치' },
  hqLocationPlaceholder: { en: 'Seoul, Korea', ko: '서울, 대한민국' },
  logoUploadTitle: { en: 'Upload logo image', ko: '로고 이미지 업로드' },
  logoUploadHint: { en: 'Drag & drop or click to choose a file', ko: '드래그 앤 드롭 또는 클릭하여 파일 선택' },
  logoUploadSpec: { en: 'PNG · JPG · max 2MB · recommended 400×400px', ko: 'PNG · JPG · 최대 2MB · 권장 400x400px' },
  chooseFileBtn: { en: 'Choose file', ko: '파일 선택' },
  logoAlt: { en: 'Company logo', ko: '회사 로고' },
  fileTypeError: { en: 'Please upload a PNG or JPG image file.', ko: 'PNG 또는 JPG 이미지 파일을 업로드해 주세요.' },
  fileSizeError: { en: 'File size must be less than 2MB.', ko: '파일 용량은 2MB 이하여야 합니다.' },
} as const;

export type Lang = 'en' | 'ko';

/** Get current language from document or default to 'en'. Can be extended to use a context/store. */
export function getLang(): Lang {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'ko') return 'ko';
  return 'en';
}

/** Get both languages for a key so UI can show translation. */
export function both<K extends keyof typeof t>(key: K): { en: string; ko: string } {
  return t[key];
}

/** Get single translation for current language. */
export function tr<K extends keyof typeof t>(key: K, lang?: Lang): string {
  const lang_ = lang ?? getLang();
  return t[key][lang_];
}
