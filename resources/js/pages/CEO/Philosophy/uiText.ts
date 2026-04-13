import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Dict = Record<string, string>;

const en: Dict = {
    section: 'Section',
    stepOf: 'Step {{current}} / {{total}}',
    managementDiagnosis: 'Management Philosophy Survey',
    orgIssues: 'Organizational Issues',
    ceoConcerns: "CEO's Concerns",
    complete: 'Complete',
    selected: 'selected',
    previous: 'Previous',
    nextSection: 'Next Section',
    nextPart: 'Next Part',
    submit: 'Submit',
    submitting: 'Submitting...',
    answeredProgress: '{{answered}} / {{total}} answered',
    issuesProgress: '{{count}} / {{max}} issues selected',
    validationAnswerQuestion: 'Please answer this question before continuing.',
    validationAnswerPart: 'Please answer all questions in this part before continuing.',
    validationSelectIssue: 'Please select at least 1 organizational issue before continuing.',
    submitSuccessTitle: 'Survey submitted successfully',
    submitSuccessDesc: 'Your CEO philosophy survey has been saved.',
    submitFailedTitle: 'Submission failed',
    submitFailedDesc: 'Please check all required answers and try again.',
    submitFailedInline: 'Could not submit. Please check all answers and try again.',
    introTitle: 'Welcome to Your Survey',
    introDesc: "Let's begin your management philosophy assessment",
    introAgreeTitle: 'I Understand & Ready to Start',
    introAgreeDesc:
        'By checking this box, you confirm that you understand the purpose of this diagnostic and agree to proceed with the survey.',
};

const ko: Dict = {
    section: '섹션',
    stepOf: '섹션 {{current}} / {{total}}',
    managementDiagnosis: '경영 철학 진단',
    orgIssues: '조직 이슈',
    ceoConcerns: 'CEO 주요 우려',
    complete: '완료',
    selected: '선택됨',
    previous: '이전',
    nextSection: '다음 섹션',
    nextPart: '다음 파트',
    submit: '제출하기',
    submitting: '제출 중...',
    answeredProgress: '{{answered}} / {{total}} 문항 응답',
    issuesProgress: '{{count}} / {{max}} 이슈 선택',
    validationAnswerQuestion: '다음으로 진행하려면 문항에 응답해 주세요.',
    validationAnswerPart: '다음으로 진행하려면 현재 파트의 모든 문항에 응답해 주세요.',
    validationSelectIssue: '다음으로 진행하려면 최소 1개의 조직 이슈를 선택해 주세요.',
    submitSuccessTitle: '설문이 성공적으로 제출되었습니다',
    submitSuccessDesc: 'CEO 경영 철학 설문이 저장되었습니다.',
    submitFailedTitle: '제출에 실패했습니다',
    submitFailedDesc: '필수 응답을 확인한 뒤 다시 시도해 주세요.',
    submitFailedInline: '제출할 수 없습니다. 모든 답변을 확인한 뒤 다시 시도해 주세요.',
    introTitle: '설문을 시작합니다',
    introDesc: '경영 철학 진단을 시작해 주세요',
    introAgreeTitle: '내용을 이해했으며 시작할 준비가 되었습니다',
    introAgreeDesc:
        '이 체크를 선택하면 진단 목적을 이해하고 설문 진행에 동의한 것으로 간주됩니다.',
};

function applyVars(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)),
        template,
    );
}

export function usePhilosophyText() {
    const { i18n } = useTranslation();
    const isKo = useMemo(() => {
        const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
        return lang.startsWith('ko');
    }, [i18n.resolvedLanguage, i18n.language]);
    const dict = useMemo(() => {
        const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
        return lang.startsWith('ko') ? ko : en;
    }, [i18n.resolvedLanguage, i18n.language]);

    const tx = (key: keyof typeof en, vars?: Record<string, string | number>) =>
        applyVars(dict[key] ?? en[key], vars);

    return { tx, isKo };
}

