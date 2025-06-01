// 🔥 파일 맨 위에 강제로 추가
console.log('testlogic.js 로딩 시작');

let stageTimers = {
    stage1Start: null,
    stage2Start: null, 
    stage3Start: null,
    currentPageStart: null
};

let completeTestData = {
    userId: null,
    timestamp: null,
    stage1_selections: [],
    stage2_situation_responses: [],
    stage2_personality_responses: [],
    stage3_responses: {},
    survey_responses: {},
    completed: false,
    stage1_duration: null,
    stage2_duration: null,
    stage3_duration: null
};

// 전역에서 접근 가능하도록 설정
window.stageTimers = stageTimers;
window.completeTestData = completeTestData;

// 시간 기록 함수들
function startStage1Timer() {
    stageTimers.stage1Start = Date.now();
    completeTestData.stage1_duration = null; // 초기화
    console.log('🕒 1단계 타이머 시작:', new Date().toLocaleTimeString());
}

function startStage2Timer() {
    // 1단계 완료 시간 계산
    if (stageTimers.stage1Start) {
        const stage1Duration = (Date.now() - stageTimers.stage1Start) / 1000;
        completeTestData.stage1_duration = stage1Duration;
        console.log(`✅ 1단계 완료: ${stage1Duration.toFixed(1)}초`);
    }
    
    stageTimers.stage2Start = Date.now();
    completeTestData.stage2_duration = null; // 초기화
    console.log('🕒 2단계 타이머 시작:', new Date().toLocaleTimeString());
}

function startStage3Timer() {
    // 2단계 완료 시간 계산
    if (stageTimers.stage2Start) {
        const stage2Duration = (Date.now() - stageTimers.stage2Start) / 1000;
        completeTestData.stage2_duration = stage2Duration;
        console.log(`✅ 2단계 완료: ${stage2Duration.toFixed(1)}초`);
    }
    
    stageTimers.stage3Start = Date.now();
    completeTestData.stage3_duration = null; // 초기화
    console.log('🕒 3단계 타이머 시작:', new Date().toLocaleTimeString());
}

function completeStage3Timer() {
    // 3단계 완료 시간 계산
    if (stageTimers.stage3Start) {
        const stage3Duration = (Date.now() - stageTimers.stage3Start) / 1000;
        completeTestData.stage3_duration = stage3Duration;
        console.log(`✅ 3단계 완료: ${stage3Duration.toFixed(1)}초`);
    }
}

console.log('타이머 시스템 초기화 완료');

// 기존 testlogic.js 코드는 여기부터 시작...

class AttractionTestSystem {
    constructor() {
        this.stage1_selections = [];
        this.stage2_situation_responses = [];
        this.stage2_personality_responses = [];
        this.stage3_responses = [];
        this.currentTemplateQuestion = null;
        this.currentTemplateSubIndex = null; // 추가: 서브 질문 인덱스
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // 1단계 체크박스 이벤트
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('#categorySelection')) {
                this.handleCategorySelection();
            }
        });
        
        // 카테고리 박스 클릭 이벤트 (박스 전체 클릭 가능)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-item')) {
                const item = e.target.closest('.category-item');
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.handleCategorySelection();
                }
            }
        });
    }
    
    handleCategorySelection() {
        const checkboxes = document.querySelectorAll('#categorySelection input[type="checkbox"]');
        const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
        const stage1Btn = document.getElementById('stage1Btn');
        const errorMsg = document.getElementById('stage1Error');
        
        // 선택된 항목들의 스타일 업데이트
        checkboxes.forEach(cb => {
            const item = cb.closest('.category-item');
            if (cb.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // 3개 초과 선택 방지
        if (checkedBoxes.length > 3) {
            const lastChecked = checkedBoxes[checkedBoxes.length - 1];
            lastChecked.checked = false;
            lastChecked.closest('.category-item').classList.remove('selected');
            
            errorMsg.textContent = '최대 3개까지만 선택할 수 있습니다.';
            errorMsg.style.display = 'block';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 2000);
            return;
        }
        
        // 유효성 검사
        if (checkedBoxes.length === 0) {
            stage1Btn.disabled = true;
            errorMsg.style.display = 'none';
        } else {
            stage1Btn.disabled = false;
            errorMsg.style.display = 'none';
        }
    }

    // 상황 질문 데이터
    getSituationQuestions() {
        return [
            {
                id: 'sit_1',
                text: "여행지에서 교통 파업으로 계획이 틀어졌을 때, 당신의 모습은?",
                choices: [
                    { letter: 'A', text: '동행의 실망감을 헤아리고 다독이며 대안을 찾는 과정 자체를 즐기자고 제안한다.' },
                    { letter: 'B', text: '미리 준비한 B안으로 계획을 수정하고 진행한다.' },
                    { letter: 'C', text: '문제의 원인과 가능한 대안들을 꼼꼼히 따져보고 합리적인 경로를 탐색한다.' },
                    { letter: 'D', text: '돌발 상황도 여행의 재미라 여기며 긍정적으로 받아들인다.' }
                ]
            },
            {
                id: 'sit_2',
                text: "팀 프로젝트에서 리더 역할을 제안받았을 때, 당신의 강점은?",
                choices: [
                    { letter: 'A', text: '팀원들이 각자의 강점을 발휘하도록 지지하고 격려한다.' },
                    { letter: 'B', text: '책임감을 가지고 맡은 바에 최선을 다한다.' },
                    { letter: 'C', text: '새로운 아이디어를 도입하여 프로젝트를 혁신적으로 발전시킨다.' },
                    { letter: 'D', text: '압박감 속에서도 중심을 잃지 않고 팀에 안정감을 준다.' }
                ]
            },
            {
                id: 'sit_3',
                text: "새로운 취미를 시작할 때, 당신을 움직이는 가장 큰 동력은?",
                choices: [
                    { letter: 'A', text: '함께하는 사람들과 서로 격려하며 즐거움을 나누고 싶어서' },
                    { letter: 'B', text: '꾸준히 연습하여 실력을 향상시키고 싶어서' },
                    { letter: 'C', text: '새로운 것을 배우는 과정 자체가 흥미롭고 재미있어서' },
                    { letter: 'D', text: '내면의 성장과 만족감을 얻을 수 있어서' }
                ]
            },
            {
                id: 'sit_4',
                text: "갈등 상황에서 당신이 가장 우선시하는 것은?",
                choices: [
                    { letter: 'A', text: '모든 당사자의 감정을 이해하고 공감하려 노력한다' },
                    { letter: 'B', text: '사실관계를 정확히 파악하고 책임 있게 해결한다' },
                    { letter: 'C', text: '다양한 관점에서 근본적인 해결책을 찾는다' },
                    { letter: 'D', text: '감정적으로 휩쓸리지 않고 냉정하게 판단한다' }
                ]
            }
        ];
    }
    
    // 성향 질문 데이터
    getPersonalityQuestions() {
        return [
            {
                id: 'per_1',
                text: "나의 에너지 방향은?",
                choices: [
                    { letter: 'A', text: '외향적 교류 - 사람들과의 활발한 소통에서 에너지를 얻는다' },
                    { letter: 'B', text: '내향적 성찰 - 혼자만의 시간과 내면 탐구에서 에너지를 얻는다' }
                ]
            },
            {
                id: 'per_2',
                text: "나를 움직이는 힘은?",
                choices: [
                    { letter: 'A', text: '뚜렷한 성취 - 명확한 목표 달성을 통한 성취감' },
                    { letter: 'B', text: '과정의 탐험 - 새로운 것을 배우고 경험하는 여정 자체' }
                ]
            },
            {
                id: 'per_3',
                text: "관계에서 더 중요하게 생각하는 것은?",
                choices: [
                    { letter: 'A', text: '깊은 정서적 유대 - 마음을 나누고 이해하는 관계' },
                    { letter: 'B', text: '변치 않는 신뢰 - 약속을 지키고 일관된 관계' }
                ]
            },
            {
                id: 'per_4',
                text: "어려운 상황에서 나의 모습은?",
                choices: [
                    { letter: 'A', text: '적극적 돌파 - 목표를 향해 강하게 밀어붙인다' },
                    { letter: 'B', text: '묵묵한 꾸준함 - 차근차근 성실하게 해결한다' }
                ]
            }
        ];
    }



    // 매력 키워드 데이터
    getAttractionKeywords() {
        return {
        "이해심 및 공감 능력": ["다정함", "공감 능력", "이해심", "배려심", "경청 능력", "위로 능력", "섬세함"],
        "성실성 및 책임감": ["성실함", "책임감", "인내심", "계획성", "세심함", "신중함", "절제력"],
        "지적 호기심 및 개방성": ["호기심", "창의성", "열린 마음", "모험심", "비판적 사고력", "통찰력", "넓은 시야", "집중력"],
        "정서적 안정 및 자기 인식": ["침착함", "안정감", "자기 성찰", "긍정적", "현실 감각", "자기 객관화", "자존감", "겸손"],
        "도덕성 및 양심": ["정직함", "양심", "일관성", "원칙 준수", "진정성", "약자보호"],
        "유머감각 및 사교성": ["유머 감각", "분위기 메이커", "다양한 친분", "타인을 편하게 해주는 능력", "연락 등 관계를 이어가는 능력", "사교적 에너지"],
        "목표 지향성 및 야망": ["목표 의식", "열정", "자기 계발 의지", "리더십", "야망", "경쟁심", "전략적 사고"]
    };
}
}

// 전역 인스턴스
const testSystem = new AttractionTestSystem();

// ==================== 1단계 → 2A단계 ====================
function proceedToStage2Situation() {
    // 🕒 1단계 타이머 종료 및 2단계 타이머 시작
    startStage2Timer();
    
    const checkedBoxes = Array.from(document.querySelectorAll('#categorySelection input[type="checkbox"]:checked'));
    testSystem.stage1_selections = checkedBoxes.map(cb => cb.value);
    
    autoSaveProgress();

    // 상황 질문 렌더링
    renderSituationQuestions();
    
    // 화면 전환
    document.getElementById('stage1').style.display = 'none';
    document.getElementById('stage2Situation').style.display = 'block';
}

function renderSituationQuestions() {
    const container = document.getElementById('situationQuestionsContainer');
    const questions = testSystem.getSituationQuestions();
    container.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.innerHTML = `
            <div class="question-title">
                질문 ${index + 1}. ${question.text}
            </div>
            <div class="choices">
                ${question.choices.map(choice => `
                    <div class="choice-item" onclick="selectChoice('situation', '${question.id}', '${choice.letter}', this)">
                        <input type="radio" name="question_${question.id}" value="${choice.letter}">
                        <div>
                            <strong>${choice.letter}.</strong> ${choice.text}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(questionDiv);
    });
    
    checkSituationCompletion();
}

// ==================== 2A단계 → 2B단계 ====================
function proceedToStage2Personality() {
    
    
    // 상황 질문 응답 수집
    const responses = [];
    const questions = testSystem.getSituationQuestions();
    
    questions.forEach(question => {
        const selectedChoice = document.querySelector(`input[name="question_${question.id}"]:checked`);
        if (selectedChoice) {
            const choiceData = question.choices.find(c => c.letter === selectedChoice.value);
            responses.push({
                questionText: question.text,
                selectedChoice: choiceData
            });
        }
    });
    
    testSystem.stage2_situation_responses = responses;
    
     autoSaveProgress();

    // 성향 질문 렌더링
    renderPersonalityQuestions();
    
    // 화면 전환
    document.getElementById('stage2Situation').style.display = 'none';
    document.getElementById('stage2Personality').style.display = 'block';
}

function renderPersonalityQuestions() {
    const container = document.getElementById('personalityQuestionsContainer');
    const questions = testSystem.getPersonalityQuestions();
    container.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.innerHTML = `
            <div class="question-title">
                질문 ${index + 1}. ${question.text}
            </div>
            <div class="choices">
                ${question.choices.map(choice => `
                    <div class="choice-item" onclick="selectChoice('personality', '${question.id}', '${choice.letter}', this)">
                        <input type="radio" name="question_${question.id}" value="${choice.letter}">
                        <div>
                            <strong>${choice.letter}.</strong> ${choice.text}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(questionDiv);
    });
    
    checkPersonalityCompletion();
}

function selectChoice(stage, questionId, choiceLetter, element) {
    // 같은 질문의 다른 선택지들 선택 해제
    const questionCard = element.closest('.question-card');
    questionCard.querySelectorAll('.choice-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 현재 선택지 선택
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    if (stage === 'situation') {
        checkSituationCompletion();
    } else if (stage === 'personality') {
        checkPersonalityCompletion();
    }
}

function checkSituationCompletion() {
    const totalQuestions = testSystem.getSituationQuestions().length;
    const answeredQuestions = document.querySelectorAll('#situationQuestionsContainer input[type="radio"]:checked').length;
    const btn = document.getElementById('stage2SituationBtn');
    
    btn.disabled = answeredQuestions < totalQuestions;
}

function checkPersonalityCompletion() {
    const totalQuestions = testSystem.getPersonalityQuestions().length;
    const answeredQuestions = document.querySelectorAll('#personalityQuestionsContainer input[type="radio"]:checked').length;
    const btn = document.getElementById('stage2PersonalityBtn');
    
    btn.disabled = answeredQuestions < totalQuestions;
}

// ==================== 2B단계 → 응답 확인 ====================
function showResponseSummary() {
    // 성향 질문 응답 수집
    const responses = [];
    const questions = testSystem.getPersonalityQuestions();
    
    questions.forEach(question => {
        const selectedChoice = document.querySelector(`input[name="question_${question.id}"]:checked`);
        if (selectedChoice) {
            const choiceData = question.choices.find(c => c.letter === selectedChoice.value);
            responses.push({
                questionText: question.text,
                selectedChoice: choiceData
            });
        }
    });
    
    testSystem.stage2_personality_responses = responses;
    
    autoSaveProgress();

    // 응답 요약 렌더링
    renderResponseSummary();
    
    // 화면 전환
    document.getElementById('stage2Personality').style.display = 'none';
    document.getElementById('responseSummary').style.display = 'block';
}

function renderResponseSummary() {
    const container = document.getElementById('summaryContent');
    container.innerHTML = '';
    
    // 선택된 카테고리 표시
    const categoryDiv = document.createElement('div');
    categoryDiv.innerHTML = `
        <h4 style="color: #5a67d8; margin-bottom: 15px;">선택한 매력 카테고리</h4>
        <div class="summary-item">
            <strong>${testSystem.stage1_selections.join(', ')}</strong>
        </div>
    `;
    container.appendChild(categoryDiv);
    
    // 상황 질문 요약
    const situationDiv = document.createElement('div');
    situationDiv.innerHTML = '<h4 style="color: #5a67d8; margin: 25px 0 15px 0;">상황 질문 응답</h4>';
    testSystem.stage2_situation_responses.forEach((response, index) => {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-item';
        summaryDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">
                질문 ${index + 1}: ${response.questionText}
            </div>
            <div style="color: #5a67d8;">
                선택: ${response.selectedChoice.letter}. ${response.selectedChoice.text}
            </div>
        `;
        situationDiv.appendChild(summaryDiv);
    });
    container.appendChild(situationDiv);
    
    // 성향 질문 요약
    const personalityDiv = document.createElement('div');
    personalityDiv.innerHTML = '<h4 style="color: #5a67d8; margin: 25px 0 15px 0;">성향 질문 응답</h4>';
    testSystem.stage2_personality_responses.forEach((response, index) => {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-item';
        summaryDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">
                질문 ${index + 1}: ${response.questionText}
            </div>
            <div style="color: #5a67d8;">
                선택: ${response.selectedChoice.letter}. ${response.selectedChoice.text}
            </div>
        `;
        personalityDiv.appendChild(summaryDiv);
    });
    container.appendChild(personalityDiv);
}

function backToStage2Personality() {
    document.getElementById('responseSummary').style.display = 'none';
    document.getElementById('stage2Personality').style.display = 'block';
}

// ==================== 3단계 페이지별 이동 함수들 ====================
// 응답 확인 → 3단계 페이지 1
function proceedToStage3Page1() {
      
       // 🕒 3단계 완료 타이머 호출 추가
    startStage3Timer();

    autoSaveProgress();
    renderStage3Page(1);
    
    // 화면 전환
    document.getElementById('responseSummary').style.display = 'none';
    document.getElementById('stage3_page1').style.display = 'block';
}

// renderStage3Page 함수를 찾아서 다음과 같이 수정하세요:
function renderStage3Page(questionId) {
    const containerId = questionId === 1 ? 'reflectionContainer1' : 'reflectionContainer2';
    const container = document.getElementById(containerId);
    const allQuestions = testSystem.getReflectionQuestions();
    const currentQuestion = allQuestions.find(q => q.id === questionId);
    
    container.innerHTML = '';
    
    // 페이지 번호 계산 (1페이지면 1, 2페이지면 2)
    const pageNumber = questionId === 1 ? 1 : 2;
    
    const questionCard = document.createElement('div');
    questionCard.className = 'reflection-question-card';
    questionCard.innerHTML = `
        <div class="reflection-question-header">
            <div class="reflection-question-title">${currentQuestion.title}</div>
            <div class="reflection-question-number">${pageNumber}/2</div>
        </div>
        
       
        
        <div class="reflection-sub-questions">
            ${currentQuestion.questions.map((question, subIndex) => `
                <div class="reflection-sub-question">
                    <div class="reflection-sub-question-title">${pageNumber}-${subIndex + 1}. ${question.replace(/^\d+-\d+\.\s*/, '')}</div>
                    <div class="helper-buttons">
                        <button class="helper-btn skip" onclick="skipQuestion(${currentQuestion.id}, ${subIndex})">패스하기</button>
                        <button class="helper-btn" onclick="showExamples(testSystem.getReflectionQuestions().find(q => q.id === ${currentQuestion.id}), ${subIndex})">예시 보기</button>
                        <button class="helper-btn" onclick="showTemplate(testSystem.getReflectionQuestions().find(q => q.id === ${currentQuestion.id}), ${subIndex})">템플릿 사용</button>
                        <button class="helper-btn attraction-keyword-btn" onclick="showAttractionKeywords(${currentQuestion.id}, ${subIndex})">
                            ✨ <strong>매력 키워드 참고</strong> ✨
                        </button>
                    </div>
                    
                    <!-- 선택된 키워드 표시 영역과 답변창을 감싸는 컨테이너 -->
                    <div class="textarea-container">
                        <!-- 선택된 키워드 해시태그 영역 -->
                        <div class="selected-keywords" id="selectedKeywords_${currentQuestion.id}_${subIndex}">
                            <div class="keywords-label">선택한 매력 키워드:</div>
                            <div class="keywords-tags"></div>
                        </div>
                        
                        <textarea 
                            class="reflection-textarea" 
                            placeholder="자유롭게 생각을 적어주세요..."
                            id="reflection_${currentQuestion.id}_${subIndex}"
                            onfocus="window.currentTextarea = this; window.currentQuestionId = ${currentQuestion.id}; window.currentSubIndex = ${subIndex};"
                        ></textarea>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    container.appendChild(questionCard);
}

// 3단계 페이지 이동 함수들
function proceedToStage3Page2() {
    autoSaveProgress();
    
    // AI가 개인화된 질문 선택
    const selectedQuestionId = selectPersonalizedQuestion();
    
    // 선택된 질문 렌더링
    renderStage3Page(selectedQuestionId);
    
    // 화면 전환
    document.getElementById('stage3_page1').style.display = 'none';
    document.getElementById('stage3_page2').style.display = 'block';
}





// 뒤로가기 함수들
function backToResponseSummary() {
    document.getElementById('stage3_page1').style.display = 'none';
    document.getElementById('responseSummary').style.display = 'block';
}

function backToStage3Page1() {
    document.getElementById('stage3_page2').style.display = 'none';
    document.getElementById('stage3_page1').style.display = 'block';
}

// ==================== 3단계 → 설문조사 ====================
function proceedToSurvey() {
   
    completeStage3Timer();

    autoSaveProgress();
    
    // 3단계 응답 수집 (2개 그룹만)
    collectStage3Responses();
    
    // 설문조사 렌더링
    renderSurvey();
    
    // 화면 전환
    document.getElementById('stage3_page2').style.display = 'none';
    document.getElementById('surveyStage').style.display = 'block';
}

function collectStage3Responses() {
    const responses = [];
    const questions = testSystem.getReflectionQuestions();
    
    // 경험 탐구 (ID: 1) 수집
    const experienceGroup = questions.find(q => q.id === 1);
    if (experienceGroup) {
        const groupResponses = [];
        experienceGroup.questions.forEach((question, subIndex) => {
            const textarea = document.getElementById(`reflection_1_${subIndex}`);
            groupResponses.push({
                question: question,
                answer: textarea ? textarea.value || "[답변 없음]" : "[답변 없음]"
            });
        });
        responses.push({
            groupTitle: experienceGroup.title,
            responses: groupResponses
        });
    }
    
    // AI가 선택한 질문 수집
    const selectedQuestionId = selectPersonalizedQuestion();
    const selectedGroup = questions.find(q => q.id === selectedQuestionId);
    if (selectedGroup) {
        const groupResponses = [];
        selectedGroup.questions.forEach((question, subIndex) => {
            const textarea = document.getElementById(`reflection_${selectedQuestionId}_${subIndex}`);
            groupResponses.push({
                question: question,
                answer: textarea ? textarea.value || "[답변 없음]" : "[답변 없음]"
            });
        });
        responses.push({
            groupTitle: selectedGroup.title,
            responses: groupResponses
        });
    }
    
    testSystem.stage3_responses = responses;
}

// ==================== 도우미 기능들 ====================
function skipQuestion(groupId, subIndex) {
    const textarea = document.getElementById(`reflection_${groupId}_${subIndex}`);
    textarea.value = "[패스함]";
    textarea.style.background = "#f7fafc";
}
// 기존 코드는 그대로 두고, 아래 함수들을 추가하세요:







function insertKeyword(keyword) {
    if (window.currentTextarea) {
        const current = window.currentTextarea.value;
        window.currentTextarea.value = current + (current ? ' ' : '') + keyword;
        window.currentTextarea.focus();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 전역 변수 추가 (파일 최상단 근처에)
window.currentTextarea = null;

// 기존 renderReflectionQuestions 함수를 수정하여 버튼들이 작동하도록 업데이트
function renderReflectionQuestions(questionSet, containerId) {
    const container = document.getElementById(containerId);
    
    const html = `
        <div class="reflection-question-card">
            <div class="reflection-question-header">
                <div class="reflection-question-title">${questionSet.title}</div>
                <div class="reflection-question-number">${questionSet.id}/4</div>
            </div>
            
            <div class="reflection-sub-questions">
                ${questionSet.questions.map((question, index) => `
                    <div class="reflection-sub-question">
                        <div class="reflection-sub-question-title">${question}</div>
                        <div class="helper-buttons">
                            <button class="helper-btn" onclick="showExamples(getReflectionQuestions()[${questionSet.id - 1}], ${index})">
                                💡 답변 예시 보기
                            </button>
                            <button class="helper-btn" onclick="showTemplate(getReflectionQuestions()[${questionSet.id - 1}], ${index})">
                                📝 글쓰기 템플릿
                            </button>
                            <button class="helper-btn" onclick="showAttractionKeywords()">
                                ✨ 매력 키워드 참고
                            </button>
                            <button class="helper-btn skip">⏭️ 건너뛰기</button>
                            <button class="helper-btn bookmark">🔖 나중에 작성</button>
                        </div>
                        <textarea 
                            class="reflection-textarea" 
                            placeholder="이곳에 자유롭게 답변을 작성해주세요..." 
                            data-question-id="${questionSet.id}-${index + 1}"
                            onfocus="window.currentTextarea = this"
                        ></textarea>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}// 기존 코드는 그대로 두고, 아래 함수들을 추가하세요:

// 모달 관련 함수들 추가
// 기존 코드 끝부분에 이 함수들을 추가하세요:

// 모달 관련 함수들









// 키워드 태그 추가 함수
function addKeywordTag(keyword) {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    
    if (!questionId || subIndex === undefined) return;
    
    const keywordsContainer = document.getElementById(`selectedKeywords_${questionId}_${subIndex}`);
    const tagsContainer = keywordsContainer.querySelector('.keywords-tags');
    
    // 이미 선택된 키워드인지 확인
    const existingTags = tagsContainer.querySelectorAll('.keyword-tag');
    const existingKeywords = Array.from(existingTags).map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingKeywords.includes(keyword)) {
        // 이미 선택된 키워드라면 강조 효과
        const existingTag = Array.from(existingTags).find(tag => tag.textContent.includes(keyword));
        existingTag.style.animation = 'none';
        setTimeout(() => {
            existingTag.style.animation = 'pulse 0.5s ease-in-out';
        }, 10);
        return;
    }
    
    // 새로운 키워드 태그 생성
    const keywordTag = document.createElement('div');
    keywordTag.className = 'keyword-tag';
    keywordTag.innerHTML = `
        ${keyword}
        <button class="remove-btn" onclick="removeKeywordTag(this)" title="키워드 제거">×</button>
    `;
    
    tagsContainer.appendChild(keywordTag);
    
    // "키워드 없음" 메시지 제거
    const noKeywordsMsg = tagsContainer.querySelector('.no-keywords');
    if (noKeywordsMsg) {
        noKeywordsMsg.remove();
    }
    
    // 모달 닫기 (선택적)
    // closeModal('attractionModal');
    
    console.log(`키워드 "${keyword}" 추가됨`);
}

// 키워드 태그 제거 함수
function removeKeywordTag(button) {
    const tag = button.parentElement;
    const keyword = tag.textContent.replace('×', '').trim();
    
    tag.style.animation = 'fadeOutScale 0.3s ease-out';
    
    setTimeout(() => {
        tag.remove();
        
        // 키워드가 모두 제거되면 "키워드 없음" 메시지 표시
        const tagsContainer = tag.parentElement;
        if (tagsContainer && tagsContainer.children.length === 0) {
            const noKeywordsMsg = document.createElement('div');
            noKeywordsMsg.className = 'no-keywords';
            noKeywordsMsg.textContent = '아직 선택된 키워드가 없습니다';
            tagsContainer.appendChild(noKeywordsMsg);
        }
    }, 300);
    
    console.log(`키워드 "${keyword}" 제거됨`);
}

// 전역 변수 초기화 (기존 window.currentTextarea = null; 다음에 추가)
window.currentQuestionId = null;
window.currentSubIndex = null;

function insertKeyword(keyword) {
    if (window.currentTextarea) {
        const current = window.currentTextarea.value;
        window.currentTextarea.value = current + (current ? ' ' : '') + keyword;
        window.currentTextarea.focus();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 전역 변수 설정 (파일 최상단에 추가)
window.currentTextarea = null;

// 기존 renderReflectionQuestions 함수를 수정하여 버튼들이 작동하도록 업데이트
function renderReflectionQuestions(questionSet, containerId) {
    const container = document.getElementById(containerId);
    
    const html = `
        <div class="reflection-question-card">
            <div class="reflection-question-header">
                <div class="reflection-question-title">${questionSet.title}</div>
                <div class="reflection-question-number">${questionSet.id}/4</div>
            </div>
            
            <div class="reflection-sub-questions">
                ${questionSet.questions.map((question, index) => `
                    <div class="reflection-sub-question">
                        <div class="reflection-sub-question-title">${question}</div>
                        <div class="helper-buttons">
                            <button class="helper-btn" onclick="showExamples(getReflectionQuestions()[${questionSet.id - 1}], ${index})">
                                💡 답변 예시 보기
                            </button>
                            <button class="helper-btn" onclick="showTemplate(getReflectionQuestions()[${questionSet.id - 1}], ${index})">
                                📝 글쓰기 템플릿
                            </button>
                            <button class="helper-btn" onclick="showAttractionKeywords()">
                                ✨ 매력 키워드 참고
                            </button>
                            <button class="helper-btn skip">⏭️ 건너뛰기</button>
                            <button class="helper-btn bookmark">🔖 나중에 작성</button>
                        </div>
                        <textarea 
                            class="reflection-textarea" 
                            placeholder="이곳에 자유롭게 답변을 작성해주세요..." 
                            data-question-id="${questionSet.id}-${index + 1}"
                            onfocus="window.currentTextarea = this"
                        ></textarea>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}


function insertKeyword(keyword) {
    // 현재 포커스된 textarea에 키워드 추가
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.classList.contains('reflection-textarea')) {
        const currentValue = focusedElement.value;
        const newValue = currentValue + (currentValue ? ', ' : '') + keyword;
        focusedElement.value = newValue;
    }
}

function bookmarkQuestion(groupId, subIndex) {
    const textarea = document.getElementById(`reflection_${groupId}_${subIndex}`);
    textarea.style.borderColor = "#f6ad55";
    textarea.style.background = "#fef5e7";
    
    alert("나중에 답할 질문으로 표시되었습니다.");
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==================== 설문조사 렌더링 ====================


// 설문 유효성 검사 함수
function setupSurveyValidation() {
    const form = document.getElementById('surveyForm');
    const submitBtn = document.getElementById('surveySubmitBtn');
    
    // 필수 필드들
    const requiredFields = [
        'overall_satisfaction',
        'discovery_help', 
        'recommendation',
        'stage1_rating',
        'stage2_rating', 
        'stage3_rating',
        'needs_improvement',
        'onboarding_rating',
        'skip_option_rating',
        'example_rating',
        'template_rating',
        'keywords_rating',
        'understanding_improvement',
        'positivity_improvement'
    ];
    
    function checkFormCompletion() {
        const allCompleted = requiredFields.every(fieldName => {
            return form.querySelector(`[name="${fieldName}"]:checked`) || 
                   form.querySelector(`[name="${fieldName}"]`).value;
        });
        
        submitBtn.disabled = !allCompleted;
    }
    
    // 모든 input과 select에 이벤트 리스너 추가
    form.addEventListener('change', checkFormCompletion);
    form.addEventListener('input', checkFormCompletion);
    
    // 초기 상태 체크
    checkFormCompletion();
}

// 설문 완료 여부 확인
// ✅ 수정된 코드 - 모든 필수 필드 포함
function checkSurveyCompletion() {
    const requiredFields = [
        'overall_satisfaction',
        'discovery_help', 
        'recommendation',
        'stage1_rating',
        'stage2_rating', 
        'stage3_rating',
        'needs_improvement',
        'onboarding_rating',
        'skip_option_rating',
        'example_rating',
        'template_rating',
        'keywords_rating',
        'understanding_improvement',
        'positivity_improvement'
    ];
    
    let allCompleted = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]:checked`) || 
                     document.querySelector(`[name="${fieldName}"]`);
        if (!field || !field.value) {
            allCompleted = false;
        }
    });
    
    const submitBtn = document.getElementById('surveySubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = !allCompleted;
        if (allCompleted) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        }
    }
}


// 최종 완료 페이지 렌더링
function renderFinalComplete() {
    const container = document.getElementById('completeContent');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h3 style="color: #5a67d8; margin-bottom: 20px;">소중한 의견을 주셔서 감사합니다!</h3>
            <p style="margin-bottom: 30px; color: #718096;">
                여러분의 피드백은 ASTER 프로그램을 더욱 발전시키는 데 큰 도움이 됩니다.<br>
                매력 탐구 여정이 계속되기를 응원합니다! ✨
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="font-size: 14px; color: #718096;">
                    선택하신 매력 카테고리: <strong>${testSystem.stage1_selections.join(', ')}</strong><br>
                    완료 시간: ${new Date().toLocaleString('ko-KR')}
                </p>
            </div>
            <button class="btn" onclick="location.reload()">새로운 테스트 시작하기</button>
        </div>
    `;
}

// ==================== 모달 외부 클릭시 닫기 ====================
window.onclick = function(event) {
    const modals = ['exampleModal', 'templateModal', 'attractionModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

console.log('매력 분석 테스트 시스템 초기화 완료');
// 맨 아래 console.log 줄 다음에 이 코드들을 추가하세요:

// ==================== Firebase 데이터 저장 ====================

// 사용자 ID 생성 함수
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Firebase에 테스트 결과 저장
async function saveToFirebase(testData) {
    try {
        if (!window.firebaseDB) {
            console.log('Firebase가 아직 초기화되지 않았습니다. localStorage에 저장합니다.');
            localStorage.setItem('testData', JSON.stringify(testData));
            return;
        }

        const docRef = await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDB, "test_responses"), {
            userId: testData.userId || generateUserId(),
            timestamp: new Date(),
            stage1_categories: testData.stage1_categories || [],
            stage2_situation: testData.stage2_situation || [],
            stage2_personality: testData.stage2_personality || [],
            stage3_reflections: testData.stage3_reflections || [],
            survey_responses: testData.survey_responses || [],
            completed: testData.completed || false
        });

        console.log("🔥 Firebase에 데이터 저장 완료! 문서 ID:", docRef.id);
        
        // 로컬스토리지에도 백업 저장
        localStorage.setItem('testData', JSON.stringify(testData));
        localStorage.setItem('firebaseDocId', docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error("Firebase 저장 중 오류:", error);
        // 오류 발생시 로컬스토리지에라도 저장
        localStorage.setItem('testData', JSON.stringify(testData));
        alert('데이터 저장 중 일시적 오류가 발생했습니다. 브라우저에 임시 저장되었습니다.');
    }
}

// 현재 진행 상황을 Firebase에 자동 저장
function autoSaveProgress() {
    const currentData = {
        userId: localStorage.getItem('userId') || generateUserId(),
        stage1_categories: JSON.parse(localStorage.getItem('selectedCategories') || '[]'),
        stage2_situation: JSON.parse(localStorage.getItem('situationResponses') || '[]'),
        stage2_personality: JSON.parse(localStorage.getItem('personalityResponses') || '[]'),
        stage3_reflections: JSON.parse(localStorage.getItem('reflectionResponses') || '[]'),
        survey_responses: JSON.parse(localStorage.getItem('surveyResponses') || '[]'),
        completed: false,
        lastUpdated: new Date()
    };
    
    // 사용자 ID가 없으면 생성
    if (!localStorage.getItem('userId')) {
        const newUserId = generateUserId();
        localStorage.setItem('userId', newUserId);
        currentData.userId = newUserId;
    }
    
    console.log("자동 저장 시도:", currentData);
    saveToFirebase(currentData);
}

// 테스트용 데이터 저장 함수 (바로 테스트해볼 수 있도록)
async function testFirebaseSave() {
    const testData = {
        userId: generateUserId(),
        stage1_categories: ["이해심 및 공감 능력", "성실성 및 책임감"],
        stage2_situation: ["테스트 응답1", "테스트 응답2"],
        stage2_personality: ["테스트 성향1", "테스트 성향2"],
        stage3_reflections: ["테스트 성찰1", "테스트 성찰2"],
        survey_responses: [],
        completed: false,
        testMode: true
    };
    
    await saveToFirebase(testData);
    alert("테스트 데이터가 Firebase에 저장되었습니다! Firebase Console을 확인해보세요.");
}

// 맨 아래 testFirebaseSave() 함수 다음에 이 함수를 추가하세요:

// 개인화된 질문 선택 알고리즘
function selectPersonalizedQuestion() {
    const stage1Categories = testSystem.stage1_selections;
    const stage2Situation = testSystem.stage2_situation_responses;
    const stage2Personality = testSystem.stage2_personality_responses;
    
    // 1단계 매력 카테고리 분석
    const introspectiveCategories = ['정서적 안정 및 자기 인식', '도덕성 및 양심'];
    const socialCategories = ['유머감각 및 사교성', '이해심 및 공감 능력'];
    const growthCategories = ['지적 호기심 및 개방성', '목표 지향성 및 야망'];
    
    let introspectiveScore = 0;
    let socialScore = 0;
    let growthScore = 0;
    
    // 선택한 카테고리 점수 계산
    stage1Categories.forEach(category => {
        if (introspectiveCategories.includes(category)) introspectiveScore += 2;
        if (socialCategories.includes(category)) socialScore += 2;
        if (growthCategories.includes(category)) growthScore += 2;
    });
    
    // 2단계 응답 패턴 분석
    stage2Situation.forEach(response => {
        if (response.selectedChoice.letter === 'A') socialScore += 1;
        if (response.selectedChoice.letter === 'C') growthScore += 1;
        if (response.selectedChoice.letter === 'D') introspectiveScore += 1;
    });
    
    stage2Personality.forEach(response => {
        if (response.selectedChoice.letter === 'A') {
            if (response.questionText.includes('에너지')) socialScore += 1;
            if (response.questionText.includes('관계')) socialScore += 1;
        }
        if (response.selectedChoice.letter === 'B') {
            if (response.questionText.includes('에너지')) introspectiveScore += 1;
            if (response.questionText.includes('움직이는')) growthScore += 1;
        }
    });
    
    // 최고 점수 질문 선택
    if (growthScore >= introspectiveScore && growthScore >= socialScore) {
        return 3; // 성장 방향
    } else if (socialScore >= introspectiveScore) {
        return 4; // 관계성 이해
    } else {
        return 2; // 가치관 탐색
    }
}

// ==================== 키워드 태그 관리 함수들 ====================

// 키워드 태그 추가 함수
function addKeywordTag(keyword) {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    
    if (!questionId || subIndex === undefined) {
        console.log('현재 질문 정보가 없습니다');
        return;
    }
    
    const keywordsContainer = document.getElementById(`selectedKeywords_${questionId}_${subIndex}`);
    if (!keywordsContainer) {
        console.log('키워드 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    const tagsContainer = keywordsContainer.querySelector('.keywords-tags');
    if (!tagsContainer) {
        console.log('태그 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    // 이미 선택된 키워드인지 확인
    const existingTags = tagsContainer.querySelectorAll('.keyword-tag');
    const existingKeywords = Array.from(existingTags).map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingKeywords.includes(keyword)) {
        alert('이미 선택된 키워드입니다!');
        return;
    }
    
    // 새로운 키워드 태그 생성
    const keywordTag = document.createElement('div');
    keywordTag.className = 'keyword-tag';
    keywordTag.innerHTML = `
        ${keyword}
        <button class="remove-btn" onclick="removeKeywordTag(this)" title="키워드 제거">×</button>
    `;
    
    tagsContainer.appendChild(keywordTag);
    
    // "키워드 없음" 메시지 제거
    const noKeywordsMsg = tagsContainer.querySelector('.no-keywords');
    if (noKeywordsMsg) {
        noKeywordsMsg.remove();
    }
    
    console.log(`키워드 "${keyword}" 추가됨`);
    
    // 모달 닫기
    closeModal('attractionModal');
}

// 키워드 태그 제거 함수
function removeKeywordTag(button) {
    const tag = button.parentElement;
    const keyword = tag.textContent.replace('×', '').trim();
    
    tag.remove();
    
    // 키워드가 모두 제거되면 "키워드 없음" 메시지 표시
    const tagsContainer = tag.parentElement;
    if (tagsContainer && tagsContainer.children.length === 0) {
        const noKeywordsMsg = document.createElement('div');
        noKeywordsMsg.className = 'no-keywords';
        noKeywordsMsg.textContent = '아직 선택된 키워드가 없습니다';
        tagsContainer.appendChild(noKeywordsMsg);
    }
    
    console.log(`키워드 "${keyword}" 제거됨`);
}

// 전역 변수 초기화
window.currentQuestionId = null;
window.currentSubIndex = null;

// 파일 맨 아래에 추가:
function selectPersonalizedQuestion() {
    const stage1Categories = testSystem.stage1_selections;
    const stage2Situation = testSystem.stage2_situation_responses;
    const stage2Personality = testSystem.stage2_personality_responses;
    
    // 1단계 매력 카테고리 분석
    const introspectiveCategories = ['정서적 안정 및 자기 인식', '도덕성 및 양심'];
    const socialCategories = ['유머감각 및 사교성', '이해심 및 공감 능력'];
    const growthCategories = ['지적 호기심 및 개방성', '목표 지향성 및 야망'];
    
    let introspectiveScore = 0;
    let socialScore = 0;
    let growthScore = 0;
    
    // 선택한 카테고리 점수 계산
    stage1Categories.forEach(category => {
        if (introspectiveCategories.includes(category)) introspectiveScore += 2;
        if (socialCategories.includes(category)) socialScore += 2;
        if (growthCategories.includes(category)) growthScore += 2;
    });
    
    // 2단계 응답 패턴 분석
    stage2Situation.forEach(response => {
        if (response.selectedChoice.letter === 'A') socialScore += 1;
        if (response.selectedChoice.letter === 'C') growthScore += 1;
        if (response.selectedChoice.letter === 'D') introspectiveScore += 1;
    });
    
    stage2Personality.forEach(response => {
        if (response.selectedChoice.letter === 'A') {
            if (response.questionText.includes('에너지')) socialScore += 1;
            if (response.questionText.includes('관계')) socialScore += 1;
        }
        if (response.selectedChoice.letter === 'B') {
            if (response.questionText.includes('에너지')) introspectiveScore += 1;
            if (response.questionText.includes('움직이는')) growthScore += 1;
        }
    });
    
    // 최고 점수 질문 선택
    if (growthScore >= introspectiveScore && growthScore >= socialScore) {
        return 3; // 성장 방향
    } else if (socialScore >= introspectiveScore) {
        return 4; // 관계성 이해
    } else {
        return 2; // 가치관 탐색
    }
}
// 파일 끝부분에 추가:

// 템플릿 사용하기 함수


// 모달 닫기 함수 (없다면 추가)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}




// 기존 코드 마지막 부분에 이어서 추가:

// ==================== 29개 새로운 성찰 질문 데이터 ====================
AttractionTestSystem.prototype.getReflectionQuestions = function() {
    return [
        // 1. 경험 탐구 질문 그룹들 (7개)
        {
            id: 1,
            category: "경험탐구",
            type: "실패좌절극복",
            title: "실패와 좌절을 통한 성장",
            questions: [
                "혹시 기대와 다른 결과를 마주했거나 '실패'라고 느꼈지만, 오히려 그 일을 통해 나 자신을 더 깊이 알게 되거나 새로운 가능성을 발견했던 경험이 있나요? 있다면 먼저 그때의 상황을 편하게 이야기해주세요.",
                "그런 좌절 속에서도 다시 일어설 수 있었던 당신만의 강점이나 능력이 무엇이라고 생각하세요?",
                "그리고 그 경험은 지금의 당신에게 어떤 생각이나 교훈을 남겼나요?"
            ]
        },
        {
            id: 2,
            category: "경험탐구", 
            type: "성취경험",
            title: "자부심을 느꼈던 성취",
            questions: [
                "당신의 삶에서 가장 기억에 남고 자부심을 느꼈던 특별한 성취 경험을 자세히 이야기해주시겠어요?",
                "그 목표는 어떤 계기나 마음으로 시작하게 되셨나요? 혹시 목표를 이루는 과정 중에 어려웠던 점은 없었나요? 만약 있었다면 무엇이었나요?",
                "어려움이 있었다면, 그것을 이겨내고 빛나는 결과를 만들기 위해 당신의 어떤 능력이나, 좋은 면이 가장 큰 힘이 되었나요?",
                "그 성공은 지금 당신에게 어떤 의미로 남아 있나요?"
            ]
        },
        {
            id: 3,
            category: "경험탐구",
            type: "어려운상황대처", 
            title: "예상치 못한 상황 대처",
            questions: [
                "혹시 예상치 못한 어려움이나 당황스러운 상황에 놓였던 경험이 있다면, 먼저 그때 어떤 상황이었고 어떤 감정을 느꼈는지 편하게 이야기해주세요.",
                "그런 상황을 잘 헤쳐나가거나 마음을 다잡기 위해, 당신의 어떤 능력을 활용했던 것 같나요?",
                "그 경험을 통해 나 자신에 대해 '아, 나에게 이런 면도 있구나' 하고 새롭게 알게 된 점이 있나요?"
            ]
        },
        {
            id: 4,
            category: "경험탐구",
            type: "일상매력발견",
            title: "일상 속 자연스러운 매력",
            questions: [
                "혹시 당신에게는 너무나 일상적인 일이어서, 스스로는 '특별하다'고 잘 생각하지 않지만, 다른 사람들은 종종 칭찬하거나 의외로 고마워하는 당신만의 행동이 있나요?",
                "그 일을 '아, 나 이런 것도 잘하네?' 하고 처음 느끼게 된 순간이나, 그것을 하면서 즐거움을 느꼈던 경험을 자세히 들려주세요.",
                "그렇게 발견한 일상 속 매력을 앞으로 어떻게 더 활용하거나 발전시키고 싶으신가요?"
            ]
        },
        {
            id: 5,
            category: "경험탐구",
            type: "주도적개선",
            title: "주도적으로 개선한 경험", 
            questions: [
                "누가 먼저 부탁하지 않았는데도, '이건 내가 한번 해봐야겠다!' 싶어서 먼저 나서서 어떤 일(아주 작은 일도 괜찮아요)을 더 좋게 만들려고 했던 경험이 있다면 먼저 그 이야기를 들려주세요.",
                "어떤 마음 혹은 어떤 목표 때문에 당신은 그렇게 행동했나요?",
                "그 행동을 통해, 당신의 좋은 성향이나 평소 중요하게 생각하는 가치을 발견하거나 다시 한번 느끼게 되었나요? 그 성향이나 가치는 무엇인가요?"
            ]
        },
        {
            id: 6,
            category: "경험탐구",
            type: "꾸준한노력",
            title: "꾸준한 노력으로 이룬 성취",
            questions: [
                "하나의 목표를 향해 꽤 긴 시간 동안 꾸준히 노력하여, 마침내 무언가를 이룬 경험(예: 악기 하나쯤 다루게 된 것, 외국어 공부, 오래 준비한 프로젝트 마무리 등)이 있다면 그 성취에 대해 이야기해주세요.",
                "그 긴시간을 포기하지 않고 계속 나아갈 수 있었던 점에 대해 당신의 어떤 강점이 도움이 된 것 같나요?",
                "그 성취를 이루고 나서, 당신의 삶이나 생각에 어떤 긍정적인 변화가 찾아왔나요?"
            ]
        },
        {
            id: 7,
            category: "경험탐구",
            type: "용기있는시도",
            title: "용기를 내어 새로운 시도",
            questions: [
                "일상에서 평소 나라면 주저 했을 법한 작은 일에 용기를 내어 시도해본 경험이 있나요?(예: 새로운 길로 가보기, 평소 안 하던 스타일 시도해보기 등) 어떤 경험 이었나요?",
                "당신에게 존재하는 어떤 면이 발휘되어 용기를 낼 수 있었을까요?",
                "그 경험을 통해 나 자신이나 나의 강점, 내적인 매력에 대해 새롭게 느끼거나 깨닫게 된 점이 있나요?"
            ]
        },

        // 2. 가치관 탐색 질문 그룹들 (7개)
        {
            id: 8,
            category: "가치탐구",
            type: "소중한기준",
            title: "소중한 기준과 생각",
            questions: [
                "혹시 다른 건 몰라도 이것만큼은 꼭 지키고 싶다고 마음속으로 다짐하는, 당신만의 소중한 기준이나 생각이 있나요? 있다면 어떤 것인지 이야기해주세요.",
                "그런 기준이나 생각을 갖게 된 특별한 계기나, 영향을 받은 인물이 있다면 그 이야기를 들려주실 수 있나요?",
                "그 기준이나 생각이 당신의 삶에 긍정적인 영향을 줬다고 생각하시나요? 그렇다면 어떤 면에서 긍정적인 영향을 받았나요?"
            ]
        },
        {
            id: 9,
            category: "가치탐구",
            type: "선택의갈등",
            title: "가치관의 갈등과 선택",
            questions: [
                "어떤 것을 선택해야 할지, 마음속에서 중요하다고 생각하는 두 가지가 부딪혔던 순간이 있었나요? 그때 어떤 상황이었는지 알려주세요.",
                "그때 어떤 고민들을 하셨고, 결국 어떤 마음으로 하나의 선택을 내리셨는지 궁금해요.",
                "그 결정을 내리는 데 당신이 중요시여기는 가치 중 어떤 점이 가장 큰 영향을 주었다고 생각하시나요?"
            ]
        },
        {
            id: 10,
            category: "가치탐구",
            type: "대인관계태도",
            title: "대인관계에서의 소중한 태도",
            questions: [
                "다른 사람들을 대할 때, 당신이 가장 중요하게 여기고 '이렇게 해야지' 하고 지키려고 하는 생각이나 태도가 있으신가요?",
                "그러한 생각이나 태도를 갖게 된 특별한 이유나 계기가 있을까요?",
                "그런 마음가짐을 잘 지키는 당신 자신을 볼 때, 스스로 '나 이런 점은 괜찮네!' 하고 느끼는 자신의 내적인 매력은 무엇인가요?"
            ]
        },
        {
            id: 11,
            category: "가치탐구",
            type: "변화속다짐",
            title: "변화 속에서도 지킨 소중한 것",
            questions: [
                "인생의 큰 변화를 겪거나 예상치 못한 어려움 속에서도, '이것만은 꼭 놓치지 말아야지' 했던 소중한 생각이나 다짐이 있나요? 있다면 어떤 것이었나요?",
                "그 복잡하고 혼란스러운 상황에서도 그것을 꿋꿋이 지켜낼 수 있었던 당신의 내면의 힘은 무엇이었다고 생각하세요?"
            ]
        },
        {
            id: 12,
            category: "가치탐구", 
            type: "열정분야",
            title: "열정을 쏟는 분야",
            questions: [
                "혹시 시간 가는 줄 모르고 푹 빠져서 열정을 쏟는 분야나 활동이 있나요? 있다면 어떤 것인지 먼저 알려주세요.",
                "그토록 열정적으로 임하게 되는 이유나 당신에게 중요한 어떤 가치가 있으신가요?",
                "그럼 그 과정에서 당신이 발견하게 되는 자신의 강점이나, 매력은 무엇인가요?"
            ]
        },
        {
            id: 13,
            category: "가치탐구",
            type: "미래가치관",
            title: "앞으로 더 중요하게 여기고 싶은 가치",
            questions: [
                "지금도 충분히 멋지지만, 앞으로 당신의 삶에서 '이런 생각 혹은 마음가짐은 더 중요하게 여기고 싶다' 혹은 '이런 모습으로 살아가고 싶다'고 바라는 모습이 있나요?",
                "그것을 완전히 당신의 것으로 만들기 위해, 당신 안에 있는 어떤 잠재력이나 강점을 더 믿고 발전시켜나가고 싶으신가요?"
            ]
        },
        {
            id: 14,
            category: "가치탐구",
            type: "결과수용",
            title: "결과를 담담하게 수용하는 태도",
            questions: [
                "어떤 일의 결과가 생각만큼 좋지 않았을 때, 그 상황을 다른 누구의 탓으로 돌리기보다 결과를 담담하게 마주했던 경험이 있나요? 그때 어떤 마음으로 상황을 받아들였는지 이야기해주세요.",
                "그렇게 상황과 결과를 받아드렸을 때의 경험이 당신에게 성장의 원동력이 되거나 숨겨진 모습의 발견으로 이어 졌었나요? 이어 졌다면 어떤 부분에서 성장하게 되었나요?"
            ]
        },

        // 3. 성장 탐구 질문 그룹들 (8개)
        {
            id: 15,
            category: "성장탐구",
            type: "바라는성장",
            title: "바라는 성장의 모습",
            questions: [
                "앞으로 1년 뒤, 혹은 조금 더 먼 미래에 '아, 나 정말 성장 했구나'라고 느끼고 싶은, 당신이 가장 바라는 성장한 모습은 어떤 모습인가요?",
                "그 멋진 모습을 현실로 만들기 위해, 지금 당신 안에 있는 어떤 강점이나 잠재력을 더 발전시키고 싶으신가요?"
            ]
        },
        {
            id: 16,
            category: "성장탐구",
            type: "새로운배움",
            title: "새롭게 배우고 싶은 분야",
            questions: [
                "만약 무엇이든 새롭게 배울 수 있는 충분한 시간과 기회가 주어진다면, 가장 먼저 배우거나 경험해보고 싶은 분야는 무엇인가요?",
                "그것을 배우고 싶은 가장 큰 이유는 당신의 어떤 점(예: 지금 가진 장점을 더 키우고 싶어서, 아니면 새로운 가능성을 열고 싶어서) 때문인가요?",
                "그 배움이 당신의 어떤 내적인 강점을 채워줄 수 있을 거라고 생각하시나요?"
            ]
        },
        {
            id: 17,
            category: "성장탐구",
            type: "개선하고싶은점",
            title: "개선하고 싶은 나의 모습",
            questions: [
                "지금 당신의 모습 중에서, '이 부분은 앞으로 이렇게 더 좋아지면 좋겠다'고 스스로 변화를 바라는 지점이 있다면 어떤 것인가요?",
                "만약 그 부분이 당신이 바라는 대로 긍정적으로 변화한다면, 당신의 일상이나 마음은 어떻게 달라질 것 같나요?",
                "만약 그 부분의 변화로 인해 잃게 될 수도 있는 현재의 장점에 대해 생각해 보셨나요? 내가 바라는 변화로 인해 잃게 될지도 모르는 현재 내가 가지고 있는 장점에 대해 작성해주세요"
            ]
        },
        {
            id: 18,
            category: "성장탐구",
            type: "좋은영향",
            title: "세상에 주고 싶은 좋은 영향",
            questions: [
                "앞으로 당신이 주변 사람들이나 세상에 좋은 영향을 주고 싶다는 생각을 해본 적 있나요? 있다면 어떤 영향인가요?",
                "그러한 영향을 주기 위해, 당신이 이미 가지고 있거나 더욱 발전시키고 싶은 좋은 면이나 뛰어난 능력은 무엇인가요?",
                "그 매력을 어떤 멋진 방식으로 활용하여 좋은 영향을 주고 싶으신가요?"
            ]
        },
        {
            id: 19,
            category: "성장탐구",
            type: "타인으로부터배움",
            title: "타인으로부터 배우고 싶은 점",
            questions: [
                "혹시 최근에 다른 사람의 모습이나 행동을 보면서 '아, 나도 저런 점은 배우고 싶다!' 또는 '참 괜찮다'라고 마음속으로 생각했던 순간이 있나요?",
                "그 사람의 어떤 매력이 당신에게 그런 생각을 하게 만들었나요?",
                "만약 그 좋은 점을 당신의 것으로 만들고 싶다면, 어떤 작은 시도부터 해볼 수 있을까요?"
            ]
        },
        {
            id: 20,
            category: "성장탐구",
            type: "외부평가영향",
            title: "외부 평가의 영향과 내면의 목소리",
            questions: [
                "혹시 다른 사람들의 반응이나 평가(예: 칭찬이나 아쉬운 소리 등)에 따라 나의 기분이나 나 자신에 대한 생각이 크게 영향을 받는다고 느낄 때가 있나요? 있다면 주로 어떤 경우에 그런 것 같나요?",
                "그렇다면, 외부의 시선 때문에 스스로 충분히 인정해주지 못했지만, '사실 이건 내가 정말 잘하는 부분인데' 혹은 '이런 내 모습이 나는 참 괜찮은데' 하고 생각해봤던 나만의 강점이나 매력이 있나요?",
                "앞으로 다른 사람의 평가보다는 당신 스스로의 목소리에 더 귀 기울여 그 매력을 믿고 키워나간다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ]
        },
        {
            id: 21,
            category: "성장탐구",
            type: "자기엄격성",
            title: "스스로에게 엄격한 모습",
            questions: [
                "스스로에게 너무 엄격해서, 다른 사람이 보기엔 충분히 괜찮거나 좋은 점인데도 '이건 별거 아니야'라며 넘겨버리거나 스스로 낮춰 보았던 모습이나 생각있나요? 있다면 어떤 부분인가요?",
                "만약 그런 당신의 좋은 점을 충분히 인정해주지 못했다면, 그 이유는 무엇이었을까요? (예: 과거의 경험, 타인의 평가, 완벽주의 성향 등)",
                "이제 그 '별거 아니라고 생각했던' 당신의 그 모습을 제대로 인식하고 '소중한 매력'으로 인정해준다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ]
        },
        {
            id: 22,
            category: "성장탐구",
            type: "반전매력",
            title: "아쉬운 점의 반전 매력",
            questions: [
                "혹시 스스로 생각하기에 '이건 나의 아쉬운점 이야' 또는 '이것 때문에 가끔 손해를 보거나 힘들어'라고 여기는 당신의 어떤 모습이나 성향이 있나요? 있다면 어떤 부분인지 편하게 이야기해주세요.",
                "그렇다면, 그 '아쉬운 점'이라고 생각했던 모습이 혹시 다른 상황이나 다른 관점에서 보면 오히려 긍정적인 역할을 하거나, 더 좋은 결과를 만들 수 있는 가능성에 대해 생각해 본 적 있나요? (예를 들어, '너무 생각이 많아 결정을 못 한다'는 것이 '신중하고 다각도로 고민한다'는 것일 수도 있는 것처럼요.)",
                "만약 당신의 그 '아쉬운 점' 이면에 숨겨진 긍정적인 면이나 가능성을 발견한다면, 그것을 당신의 새로운 '반전 매력'과 같은 이름을 붙여 인정해준다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ]
        },

        // 4. 관계 탐구 질문 그룹들 (7개)
        {
            id: 23,
            category: "관계탐구",
            type: "새로운만남",
            title: "새로운 사람들과의 만남",
            questions: [
                "새로운 사람들을 만나거나 여러 사람이 모인 자리에서, 어색함을 풀고 자연스럽게 대화를 시작하는 당신만의 특별한 방법이 있나요? 있다면 어떤 것인가요?",
                "그런 당신의 먼저 다가가는 용기나 다른 사람을 편안하게 해주는 능력 덕분에 좋은 관계로 발전했던 경험이 있다면 이야기해주세요."
            ]
        },
        {
            id: 24,
            category: "관계탐구",
            type: "분위기전환",
            title: "분위기를 긍정적으로 전환하는 능력",
            questions: [
                "혹시 조금 무겁거나 어색했던 분위기를 당신의 재치 있는 말이나 행동으로 기분 좋게 전환했던 경험이 있나요? 그때 어떤 상황이었는지 먼저 들려주세요.",
                "그 순간, 당신의 어떤 장점이나 매력이 빛을 발했고, 그 덕분에 분위기가 어떻게 긍정적으로 바뀌었나요?"
            ]
        },
        {
            id: 25,
            category: "관계탐구",
            type: "약속과책임",
            title: "약속과 책임을 지키는 마음",
            questions: [
                "친구와의 약속을 지키거나 단체 활동에서 맡은 역할에 책임을 다하는 것이 당신에게 중요한가요? 그 이유는 무엇인가요?",
                "혹시 어려운 상황에서도 그 약속이나 책임을 끝까지 지키려고 노력했던 경험이 있다면, 그 경험을 통해 스스로 발견하게 된 당신의 강점은 무엇이었나요?"
            ]
        },
        {
            id: 26,
            category: "관계탐구",
            type: "다른관점수용",
            title: "다른 관점을 수용하는 태도",
            questions: [
                "나와 생각이 아주 다른 사람과 의견을 나누어야 할 때 그때 상대방의 입장을 이해하고 존중하며 대화를 이끌어가기 위해 노력을 해본 경험이 있나요?",
                "다른 관점을 받아들이고 함께 좋은 대화를 만들려고 할 때, 당신의 어떤 태도나 자세가 도움이 되었다고 생각하세요?"
            ]
        },
        {
            id: 27,
            category: "관계탐구",
            type: "함께하는경험",
            title: "사람들과 함께 만들어낸 즐거운 경험",
            questions: [
                "다른 사람들과 함께 무언가를 계획하고 실행해서, 모두가 '정말 즐거웠다!'고 느꼈던 특별한 경험(예: 함께 준비한 이벤트, 여행 등)이 있다면 자세히 이야기해주세요.",
                "그 과정에서 사람들을 하나로 모이고 즐거운 분위기가 형성 될 수 있었던 데에 당신이 어떤 역할을 담당 하였나요? 그리고 그 역할을 수행함에 있어 당신의 어떤 내적인 매력이 도움이 되었나요?"
            ]
        },
        {
            id: 28,
            category: "관계탐구",
            type: "관계회복",
            title: "관계 회복을 위한 용기",
            questions: [
                "혹시 친구나 가까운 사람과 오해가 생겨 마음이 상했지만, 먼저 다가가 관계를 다시 좋게 만들려고 노력했던 경험이 있나요? 있다면 어떤 상황이었나요?",
                "그때 당신의 어떤 마음이나 생각이 그런 용기 있는 행동을 가능하게 한 것 같나요?",
                "그런 선택을 할 수 있었던 데에 자신의 어떤 면이 도움이 되었던 것 같나요?"
            ]
        },
        {
            id: 29,
            category: "관계탐구",
            type: "위로와지지",
            title: "타인에게 위로와 힘을 주는 능력",
            questions: [
                "주변 사람이 힘든 시간을 보내고 있을 때, 당신의 따뜻한 말이나 행동으로 그에게 힘을 주었던 경험이 있다면 들려주세요.",
                "당신의 어떤 태도나 자세 덕분에 위로를 받은 사람이 기운을 차리고 용기를 얻은 것 같으신가요? 그리고 그때의 기분은 어땠나요?"
            ]
        }
    ];
};

// ==================== AI 개인화 질문 선택 알고리즘 ====================
function selectPersonalizedQuestion() {
    const selectedCategories = testSystem.stage1_selections;
    const situationResponses = testSystem.stage2_situation_responses;
    const personalityResponses = testSystem.stage2_personality_responses;
    
    console.log('🤖 AI 개인화 질문 선택 시작:', {
        categories: selectedCategories,
        situation: situationResponses,
        personality: personalityResponses
    });
    

    
    // 각 영역별 점수 계산
    let valueScore = 0;    // 가치탐구 (8-14)
    let growthScore = 0;   // 성장탐구 (15-22)
    let relationScore = 0; // 관계탐구 (23-29)
    
    // 1단계 매력 카테고리별 점수 부여
    selectedCategories.forEach(category => {
        switch(category) {
            case "도덕성 및 양심":
            case "성실성 및 책임감":
                valueScore += 3;
                break;
            case "정서적 안정 및 자기 인식":
                valueScore += 2;
                growthScore += 1;
                break;
            case "지적 호기심 및 개방성":
            case "목표 지향성 및 야망":
                growthScore += 3;
                break;
            case "이해심 및 공감 능력":
            case "유머감각 및 사교성":
                relationScore += 3;
                break;
        }
    });
    
    // 2단계 응답 패턴 분석
    situationResponses.forEach(response => {
        const choice = response.selectedChoice.letter;
        switch(choice) {
            case 'A': relationScore += 1; break;
            case 'B': valueScore += 1; break;
            case 'C': growthScore += 1; break;
            case 'D': valueScore += 1; break;
        }
    });
    
    personalityResponses.forEach(response => {
        const choice = response.selectedChoice.letter;
        switch(choice) {
            case 'A': 
                if (response.questionText.includes('에너지')) relationScore += 1;
                else if (response.questionText.includes('관계')) relationScore += 1;
                else growthScore += 1;
                break;
            case 'B':
                if (response.questionText.includes('에너지')) valueScore += 1;
                else valueScore += 1;
                break;
        }
    });
    
    console.log('🎯 점수 계산 결과:', {
        valueScore,
        growthScore,
        relationScore
    });
    
    // 최고 점수 영역 결정
    let selectedCategory;
    let questionIds;
    
    if (growthScore >= valueScore && growthScore >= relationScore) {
        selectedCategory = "성장탐구";
        questionIds = [15, 16, 17, 18, 19, 20, 21, 22];
    } else if (relationScore >= valueScore) {
        selectedCategory = "관계탐구";
        questionIds = [23, 24, 25, 26, 27, 28, 29];
    } else {
        selectedCategory = "가치탐구";
        questionIds = [8, 9, 10, 11, 12, 13, 14];
    }
    
    // 해당 영역에서 랜덤 선택
    const randomIndex = Math.floor(Math.random() * questionIds.length);
    const selectedQuestionId = questionIds[randomIndex];
    
    console.log('✅ 선택된 영역:', selectedCategory);
    console.log('✅ 선택된 질문 ID:', selectedQuestionId);
    
    return selectedQuestionId;
}

// 경험 탐구 질문 선택 (항상 1-7 중 하나)
function selectExperienceQuestion() {
    const experienceQuestionIds = [1, 2, 3, 4, 5, 6, 7];
    const randomIndex = Math.floor(Math.random() * experienceQuestionIds.length);
    return experienceQuestionIds[randomIndex];
}

// ==================== 성찰 질문 렌더링 ====================
function renderStage3Page(pageNumber) {
    let questionId;
    let containerId;
    
    if (pageNumber === 1) {
        // 1페이지: 경험 탐구 질문
        questionId = selectExperienceQuestion();
        containerId = 'reflectionContainer1';
    } else {
        // 2페이지: AI 개인화 질문
        questionId = selectPersonalizedQuestion();
        containerId = 'reflectionContainer2';
    }
    
    renderReflectionQuestion(questionId, containerId, pageNumber);
}

function renderReflectionQuestion(questionId, containerId, pageNumber) {
    const container = document.getElementById(containerId);
    const allQuestions = testSystem.getReflectionQuestions();
    const question = allQuestions.find(q => q.id === questionId);
    
    if (!question) {
        console.error('❌ 질문을 찾을 수 없습니다:', questionId);
        return;
    }
    
    console.log('📝 질문 렌더링:', question.title);
    
    container.innerHTML = `
        <div class="reflection-question-card">
            <div class="reflection-question-header">
                <div class="reflection-question-title">${question.title}</div>
                <div class="reflection-question-number">${pageNumber}/2</div>
            </div>
            
            <div class="attraction-guide">
                <div class="attraction-guide-icon">✨</div>
                <div class="attraction-guide-text">
                    <strong>매력 키워드를 활용하세요!</strong><br>
                    답변 작성 시 매력 키워드를 선택하면 더 풍부한 표현을 할 수 있습니다.
                </div>
            </div>
            
            <div class="reflection-sub-questions">
                ${question.questions.map((subQuestion, index) => `
                    <div class="reflection-sub-question">
                        <div class="reflection-sub-question-title">
                            ${pageNumber}-${index + 1}. ${subQuestion}
                        </div>
                        
                        <div class="helper-buttons">
                            <button class="helper-btn skip" onclick="skipQuestion(${questionId}, ${index})">⏭️ 패스하기</button>
                            <button class="helper-btn" onclick="showExample(${questionId}, ${index})">💡 예시 보기</button>
                            <button class="helper-btn" onclick="showTemplate(${questionId}, ${index})">📝 템플릿</button>
                            <button class="helper-btn attraction-keyword-btn" onclick="showAttractionKeywords(${questionId}, ${index})">
                                ✨ <strong>매력 키워드 참고</strong> ✨
                            </button>
                        </div>
                        
                        <div class="textarea-container">
                            <div class="selected-keywords" id="selectedKeywords_${questionId}_${index}">
                                <div class="keywords-label">선택한 매력 키워드:</div>
                                <div class="keywords-tags">
                                    <div class="no-keywords">아직 선택된 키워드가 없습니다</div>
                                </div>
                            </div>
                            
                            <textarea 
                                class="reflection-textarea" 
                                placeholder="자유롭게 생각을 적어주세요..."
                                id="reflection_${questionId}_${index}"
                                onfocus="window.currentTextarea = this; window.currentQuestionId = ${questionId}; window.currentSubIndex = ${index};"
                                oninput="saveReflectionAnswer(${questionId}, ${index}, this.value)"
                            ></textarea>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 이전 답변 복원
    restoreReflectionAnswers(questionId);
}

// ==================== 답변 저장 및 복원 ====================
function saveReflectionAnswer(questionId, subIndex, value) {
    if (!testSystem.stage3_responses) {
        testSystem.stage3_responses = {};
    }
    
    if (!testSystem.stage3_responses[questionId]) {
        testSystem.stage3_responses[questionId] = {};
    }
    
    testSystem.stage3_responses[questionId][subIndex] = value;
    console.log('💾 답변 저장:', questionId, subIndex, value.substring(0, 30) + '...');
}

function restoreReflectionAnswers(questionId) {
    if (testSystem.stage3_responses && testSystem.stage3_responses[questionId]) {
        Object.keys(testSystem.stage3_responses[questionId]).forEach(subIndex => {
            const textarea = document.getElementById(`reflection_${questionId}_${subIndex}`);
            if (textarea) {
                textarea.value = testSystem.stage3_responses[questionId][subIndex];
            }
        });
    }
}

// ==================== 도우미 기능들 ====================
function skipQuestion(questionId, subIndex) {
    const textarea = document.getElementById(`reflection_${questionId}_${subIndex}`);
    if (textarea) {
        textarea.value = "[패스함]";
        textarea.style.background = "#f7fafc";
        saveReflectionAnswer(questionId, subIndex, "[패스함]");
    }
}






// ==================== 키워드 태그 관리 ====================
function addKeywordTag(keyword) {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    
    if (!questionId || subIndex === undefined) return;
    
    const keywordsContainer = document.getElementById(`selectedKeywords_${questionId}_${subIndex}`);
    const tagsContainer = keywordsContainer.querySelector('.keywords-tags');
    
    // 이미 선택된 키워드인지 확인
    const existingTags = tagsContainer.querySelectorAll('.keyword-tag');
    const existingKeywords = Array.from(existingTags).map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingKeywords.includes(keyword)) {
        alert('이미 선택된 키워드입니다!');
        return;
    }
    
    // "키워드 없음" 메시지 제거
    const noKeywordsMsg = tagsContainer.querySelector('.no-keywords');
    if (noKeywordsMsg) {
        noKeywordsMsg.remove();
    }
    
    // 새로운 키워드 태그 생성
    const keywordTag = document.createElement('div');
    keywordTag.className = 'keyword-tag';
    keywordTag.innerHTML = `
        ${keyword}
        <button class="remove-btn" onclick="removeKeywordTag(this)" title="키워드 제거">×</button>
    `;
    
    tagsContainer.appendChild(keywordTag);
    console.log(`✨ 키워드 "${keyword}" 추가됨`);
    
    // 모달 닫기
    closeModal('attractionModal');
}

function removeKeywordTag(button) {
    const tag = button.parentElement;
    const keyword = tag.textContent.replace('×', '').trim();
    
    tag.remove();
    
    // 키워드가 모두 제거되면 "키워드 없음" 메시지 표시
    const tagsContainer = tag.parentElement;
    if (tagsContainer && tagsContainer.children.length === 0) {
        const noKeywordsMsg = document.createElement('div');
        noKeywordsMsg.className = 'no-keywords';
        noKeywordsMsg.textContent = '아직 선택된 키워드가 없습니다';
        tagsContainer.appendChild(noKeywordsMsg);
    }
    
    console.log(`🗑️ 키워드 "${keyword}" 제거됨`);
}

// ==================== 설문조사 렌더링 ====================


function checkSurveyCompletion() {
    const requiredFields = ['overall_satisfaction', 'recommendation'];
    let allCompleted = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]:checked`);
        if (!field) {
            allCompleted = false;
        }
    });
    
    document.getElementById('surveySubmitBtn').disabled = !allCompleted;
}



function showFinalComplete() {
    document.getElementById('surveyStage').style.display = 'none';
    document.getElementById('finalComplete').style.display = 'block';
    
    document.getElementById('completeContent').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎊</div>
            <h3 style="color: #5a67d8; margin-bottom: 20px;">소중한 참여 감사합니다!</h3>
            <p style="color: #718096; line-height: 1.6;">
                ASTER 프로그램을 통해 자신의 매력을 탐색하는 시간이 되셨기를 바랍니다.<br>
                여러분의 피드백은 프로그램 개선에 큰 도움이 됩니다.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="color: #4a5568; margin-bottom: 15px;">🎯 당신이 선택한 매력 카테고리</h4>
                <p style="font-size: 16px; font-weight: bold; color: #5a67d8;">
                    ${testSystem.stage1_selections.join(' • ')}
                </p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                <p style="font-size: 14px; color: #4c51bf;">
                    💡 <strong>다음 단계 제안:</strong><br>
                    오늘 작성한 성찰 내용을 바탕으로 지속적인 자기계발에 도전해보세요!<br>
                    자신만의 매력을 더욱 발전시켜 나가시길 응원합니다.
                </p>
            </div>
            
            <div style="margin-top: 30px;">
                <button class="btn" onclick="location.reload()">새로운 테스트 시작하기</button>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                완료 시간: ${new Date().toLocaleString('ko-KR')}
            </div>
        </div>
    `;
}

// ==================== 유// filepath: /Users/jangjinhyuk/Documents/Aster coding/attraction test/js/testlogic.js
// 기존 코드 마지막 부분에 이어서 추가:

// ==================== 29개 새로운 성찰 질문 데이터 ====================
AttractionTestSystem.prototype.getReflectionQuestions = function() {
    return [
        // 1. 경험 탐구 질문 그룹들 (7개)
        {
            id: 1,
            category: "경험탐구",
            type: "실패좌절극복",
            title: "실패와 좌절을 통한 성장",
            questions: [
                "혹시 기대와 다른 결과를 마주했거나 '실패'라고 느꼈지만, 오히려 그 일을 통해 나 자신을 더 깊이 알게 되거나 새로운 가능성을 발견했던 경험이 있나요? 있다면 먼저 그때의 상황을 편하게 이야기해주세요.",
                "그런 좌절 속에서도 다시 일어설 수 있었던 당신만의 강점이나 능력이 무엇이라고 생각하세요?",
                "그리고 그 경험은 지금의 당신에게 어떤 생각이나 교훈을 남겼나요?"
            ],
            examples: [
        [ // 첫 번째 질문의 예시들
            "예시 1: \"네, 대학교 때 교양수업 팀 프로젝트에서 발표를 맡았는데, 너무 긴장해서 준비한 내용을 제대로 전달하지 못했어요. 팀원들에게 미안했고 스스로에게도 실망스러웠습니다.\"",
            "예시 2: \"친구와 함께 작은 온라인 쇼핑몰을 열었는데, 생각보다 판매가 저조해서 몇 달 만에 접어야 했어요. 시간과 노력을 많이 투자했는데 결과가 좋지 않아 속상했습니다.\"",
            "예시 3: \"자격증 시험에 응시했는데, 합격할 거라고 기대했지만 불합격 통보를 받았어요. 공부를 열심히 했다고 생각했는데 떨어져서 허탈했습니다.\""
        ],
        [ // 두 번째 질문의 예시들
            "예시 1: \"발표는 망쳤지만, 그 후로 발표 연습을 정말 열심히 했어요. '포기하지 않고 노력하는 끈기'가 있었던 것 같아요. 그리고 팀원들이 괜찮다고 다독여줘서 힘을 낼 수 있었고요.\"",
            "예시 2: \"판매는 부진했지만, 친구와 함께 '문제점을 분석하고 다음엔 어떻게 개선할지' 계속 이야기했어요. 좌절하기보다 '해결책을 찾으려는 긍정적인 태도'가 도움이 된 것 같습니다.\"",
            "예시 3: \"불합격했지만, '결과를 깨끗하게 인정하고 다시 도전하는 마음'이 중요하다고 생각했어요. 오답 노트를 만들면서 제 약점을 파악했고, 다음 시험을 바로 준비했죠. '자기 객관화 능력'이 있었던 것 같아요.\""
        ],
        [ // 세 번째 질문의 예시들
            "예시 1: \"'실패는 성공의 어머니'라는 말을 실감했어요. 그때의 경험 덕분에 지금은 어떤 발표든 미리 철저히 준비하고 연습하는 습관이 생겼어요.\"",
            "예시 2: \"아이디어만 좋다고 성공하는 건 아니라는 걸 배웠어요. 시장 조사나 마케팅 같은 현실적인 부분의 중요성을 깨달았습니다.\"",
            "예시 3: \"한 번의 실패로 모든 것이 끝나는 건 아니라는 교훈을 얻었어요. 중요한 건 '다시 시작할 수 있는 용기'라는 걸 알게 됐습니다.\""
        ]
    ]
        },
        {
            id: 2,
            category: "경험탐구", 
            type: "성취경험",
            title: "자부심을 느꼈던 성취",
            questions: [
                "당신의 삶에서 가장 기억에 남고 자부심을 느꼈던 특별한 성취 경험을 자세히 이야기해주시겠어요?",
                "그 목표는 어떤 계기나 마음으로 시작하게 되셨나요? 혹시 목표를 이루는 과정 중에 어려웠던 점은 없었나요? 만약 있었다면 무엇이었나요?",
                "어려움이 있었다면, 그것을 이겨내고 빛나는 결과를 만들기 위해 당신의 어떤 능력이나, 좋은 면이 가장 큰 힘이 되었나요?",
                "그 성공은 지금 당신에게 어떤 의미로 남아 있나요?"
            ],
             examples: [
        [
                "예시 1: \"고등학교 때 학교 축제에서 연극을 기획하고 연출했던 경험이 가장 기억에 남아요. 처음부터 끝까지 제가 주도적으로 만들어낸 작품이었거든요.\"",
                "예시 2: \"6개월 동안 매일 새벽에 일어나서 토익 공부를 해서 목표 점수를 달성했을 때 정말 뿌듯했어요. 스스로와의 약속을 지켜낸 느낌이었어요.\"",
                "예시 3: \"대학생 때 봉사활동 동아리에서 혼자 힘으로 후원금을 모아서 아이들에게 선물을 전달한 경험이 가장 자랑스러워요.\""
            ],
            [
                "예시 1: \"평소 연극이나 공연에 관심이 많았는데, 축제 기획 공모에 도전해보고 싶다는 마음이 생겼어요. 과정에서 배우들과 의견 충돌도 있었고, 예산 부족 문제도 있었습니다.\"",
                "예시 2: \"취업 준비 때문에 토익 점수가 필요했어요. 하지만 매일 새벽 공부는 정말 힘들었고, 중간에 포기하고 싶을 때가 많았어요.\"",
                "예시 3: \"아이들이 어려운 환경에 있다는 걸 알고 도움을 주고 싶었어요. 하지만 혼자서 후원금을 모으는 게 생각보다 어려웠고, 사람들을 설득하는 것도 쉽지 않았습니다.\""
            ],
            [
                "예시 1: \"문제 해결 능력과 끝까지 해내는 책임감이 가장 큰 힘이 되었던 것 같아요. 어려움이 생겨도 포기하지 않고 대안을 찾으려고 노력했거든요.\"",
                "예시 2: \"스스로와 한 약속은 반드시 지키려는 의지력과, 목표를 세분화해서 계획적으로 접근하는 능력이 도움이 되었어요.\"",
                "예시 3: \"다른 사람을 진심으로 돕고 싶어하는 마음과, 사람들에게 진정성 있게 다가가는 소통 능력이 큰 역할을 했던 것 같아요.\""
            ],
            [
                "예시 1: \"그 경험을 통해 제가 리더십이 있고 창의적인 사람이라는 걸 알게 되었어요. 지금도 어떤 프로젝트든 적극적으로 참여하게 되는 원동력이 되고 있습니다.\"",
                "예시 2: \"꾸준함의 힘을 믿게 되었어요. 지금도 무언가를 배울 때 단기간에 결과를 바라지 않고 꾸준히 노력하는 습관이 생겼습니다.\"",
                "예시 3: \"다른 사람을 돕는 일에서 큰 보람을 느낀다는 걸 확실히 알게 되었어요. 지금도 기회가 있을 때마다 봉사활동에 참여하고 있습니다.\""
            ]
    ]
        },
        {
            id: 3,
            category: "경험탐구",
            type: "어려운상황대처", 
            title: "예상치 못한 상황 대처",
            questions: [
                "혹시 예상치 못한 어려움이나 당황스러운 상황에 놓였던 경험이 있다면, 먼저 그때 어떤 상황이었고 어떤 감정을 느꼈는지 편하게 이야기해주세요.",
                "그런 상황을 잘 헤쳐나가거나 마음을 다잡기 위해, 당신의 어떤 능력을 활용했던 것 같나요?",
                "그 경험을 통해 나 자신에 대해 '아, 나에게 이런 면도 있구나' 하고 새롭게 알게 된 점이 있나요?"
            ],
            examples: [
    [ // 첫 번째 하위 질문: "예상치 못한 어려움이나 당황스러운 상황..."
        "예시 1: \"갑자기 비가 와서 야외 행사가 취소될 위기에 처했을 때, 처음엔 당황스럽고 답답했어요. 많은 사람들이 기대하고 있었는데 실망시킬까 봐 걱정됐습니다.\"",
        "예시 2: \"중요한 시험 당일에 지하철이 고장나서 늦을 뻔했을 때, 정말 당황스러웠어요. 한 달 넘게 준비한 시험인데 이런 일이 생기다니 황당했습니다.\"",
        "예시 3: \"친구가 갑자기 울면서 연락해서 만나자고 했을 때, 무슨 일인지 몰라서 불안하고 어떻게 도와줘야 할지 막막했어요.\""
    ],
    [ // 두 번째 하위 질문: "그런 상황을 잘 헤쳐나가거나..."
        "예시 1: \"빠르게 실내 대안 장소를 찾아보고, 참가자들에게 상황을 솔직하게 설명했어요. '유연한 사고력'과 '빠른 판단력'을 발휘한 것 같아요.\"",
        "예시 2: \"즉시 택시를 타고 다른 교통편을 알아봤어요. '위기 상황에서도 침착함을 유지하는 능력'과 '신속한 대처 능력'이 도움이 되었어요.\"",
        "예시 3: \"일단 친구 곁에 가서 충분히 이야기를 들어주었어요. '공감 능력'과 '상황을 차분히 파악하는 능력'을 활용했던 것 같아요.\""
    ],
    [ // 세 번째 하위 질문: "그 경험을 통해 나 자신에 대해..."
        "예시 1: \"위기 상황에서도 포기하지 않고 해결책을 찾는 '문제 해결 능력'이 있다는 걸 알게 되었어요. 평소엔 몰랐는데 이런 상황에서 오히려 더 집중이 잘 되더라고요.\"",
        "예시 2: \"예상치 못한 일이 생겨도 '차분하게 대응하는 능력'이 있다는 걸 발견했어요. 친구들이 '너는 이런 상황에서도 침착하다'고 말해줘서 알게 되었습니다.\"",
        "예시 3: \"다른 사람의 마음을 잘 읽고 '적절한 위로를 해주는 능력'이 있다는 걸 느꼈어요. 제가 있어주는 것만으로도 친구가 많이 안정되는 모습을 보면서 알게 되었습니다.\""
    ]
]
        },
        {
            id: 4,
            category: "경험탐구",
            type: "일상매력발견",
            title: "일상 속 자연스러운 매력",
            questions: [
                "혹시 당신에게는 너무나 일상적인 일이어서, 스스로는 '특별하다'고 잘 생각하지 않지만, 다른 사람들은 종종 칭찬하거나 의외로 고마워하는 당신만의 행동이 있나요?",
                "그 일을 '아, 나 이런 것도 잘하네?' 하고 처음 느끼게 된 순간이나, 그것을 하면서 즐거움을 느꼈던 경험을 자세히 들려주세요.",
                "그렇게 발견한 일상 속 매력을 앞으로 어떻게 더 활용하거나 발전시키고 싶으신가요?"
            ],
            examples: [
    [
        "예시 1: \"제가 물건 정리 정돈을 습관처럼 하는 편인데, 가족들이 '네 덕분에 집이 항상 깨끗하다'고 칭찬해 줄 때가 있어요. 저는 당연하다고 생각했거든요.\"",
        "예시 2: \"새로운 사람을 만나도 먼저 말을 잘 거는 편인데, 동료가 '친화력이 정말 좋으신 것 같아요, 부러워요'라고 하더라고요. 저는 그냥 궁금해서 말을 거는 거였어요.\"",
        "예시 3: \"다른 사람이 힘들어할 때 자연스럽게 도와주는 편인데, 친구들이 '너는 정말 마음이 따뜻하다'고 자주 말해줘요. 저는 그냥 당연한 일이라고 생각했는데요.\""
    ],
    [
        "예시 1: \"룸메이트가 '너 없으면 우리 방이 어떻게 될지 모르겠다'고 농담처럼 말했을 때, '아, 내가 이런 걸 잘하는구나'라고 처음 생각해봤어요. 그때 뿌듯했습니다.\"",
        "예시 2: \"신입사원 환영회에서 어색해하는 후배들과 자연스럽게 대화하며 분위기를 풀어주었을 때, 선배들이 '덕분에 분위기가 좋아졌다'고 해주셔서 기분이 좋았어요.\"",
        "예시 3: \"친구가 이사할 때 자연스럽게 도와주러 갔는데, '너는 진짜 든든한 친구야'라고 고마워해줄 때 '아, 이런 것도 나의 장점이구나' 싶었어요.\""
    ],
    [
        "예시 1: \"주변 사람들의 공간을 더 효율적으로 정리해주는 작은 봉사활동 같은 걸 해보고 싶어요. 제 이런 능력이 누군가에게 도움이 될 수 있다면 좋겠습니다.\"",
        "예시 2: \"더 다양한 사람들과 적극적으로 교류하면서 제 인간관계를 넓히고 싶어요. 새로운 모임이나 활동에도 더 용기 내어 참여해 볼 생각입니다.\"",
        "예시 3: \"앞으로도 주변 사람들의 이야기에 더 귀 기울이고 공감해 주는 사람이 되고 싶어요. 가능하다면 상담 관련 공부도 조금 해보고 싶다는 생각이 들었습니다.\""
    ]
]

        },
        {
            id: 5,
            category: "경험탐구",
            type: "주도적개선",
            title: "주도적으로 개선한 경험", 
            questions: [
                "누가 먼저 부탁하지 않았는데도, '이건 내가 한번 해봐야겠다!' 싶어서 먼저 나서서 어떤 일(아주 작은 일도 괜찮아요)을 더 좋게 만들려고 했던 경험이 있다면 먼저 그 이야기를 들려주세요.",
                "어떤 마음 혹은 어떤 목표 때문에 당신은 그렇게 행동했나요?",
                "그 행동을 통해, 당신의 좋은 성향이나 평소 중요하게 생각하는 가치을 발견하거나 다시 한번 느끼게 되었나요? 그 성향이나 가치는 무엇인가요?"
            ],
            examples: [
    [
        "예시 1: \"동아리 회의실이 항상 어수선해서 자료 찾기가 어려웠는데, 제가 먼저 나서서 파일링 시스템을 만들어 정리했어요. 누가 시키지 않았는데 그냥 해야겠다 싶더라고요.\"",
        "예시 2: \"아르바이트하던 카페에서 손님들이 메뉴를 고르기 어려워하는 걸 보고, 제가 추천 메뉴 보드를 만들어서 설치했어요. 사장님도 모르게 먼저 해놨어요.\"",
        "예시 3: \"학과 과제 제출 시스템이 복잡해서 후배들이 자주 헤매는 걸 보고, 간단한 가이드 문서를 만들어서 단톡방에 공유했어요.\""
    ],
    [
        "예시 1: \"효율성을 추구하는 성격이어서, 모든 사람이 편리하게 이용할 수 있는 환경을 만들고 싶었어요. 시간 낭비가 싫어서 개선하고 싶었습니다.\"",
        "예시 2: \"손님들이 행복해하는 모습을 보고 싶었어요. 그리고 일하는 동료들도 손님 응대가 더 수월해지면 좋겠다는 생각이었습니다.\"",
        "예시 3: \"후배들이 헤매는 모습을 보니 안쓰러웠어요. 제가 겪었던 시행착오를 다른 사람들은 겪지 않았으면 좋겠다는 마음이었습니다.\""
    ],
    [
        "예시 1: \"효율성과 체계성을 중요하게 여기는 가치관을 재확인했어요. 그리고 다른 사람을 배려하는 마음이 저의 행동 원동력이라는 걸 알게 되었습니다.\"",
        "예시 2: \"고객 만족을 통해 보람을 느끼는 서비스 정신과, 팀워크를 중시하는 협력적인 성향을 발견했어요.\"",
        "예시 3: \"지식을 나누고 후배를 돕는 일에서 기쁨을 느끼는 멘토링 정신과, 공동체를 생각하는 사회적 책임감을 느꼈습니다.\""
    ]
],
        },
        {
            id: 6,
            category: "경험탐구",
            type: "꾸준한노력",
            title: "꾸준한 노력으로 이룬 성취",
            questions: [
                "하나의 목표를 향해 꽤 긴 시간 동안 꾸준히 노력하여, 마침내 무언가를 이룬 경험(예: 악기 하나쯤 다루게 된 것, 외국어 공부, 오래 준비한 프로젝트 마무리 등)이 있다면 그 성취에 대해 이야기해주세요.",
                "그 긴시간을 포기하지 않고 계속 나아갈 수 있었던 점에 대해 당신의 어떤 강점이 도움이 된 것 같나요?",
                "그 성취를 이루고 나서, 당신의 삶이나 생각에 어떤 긍정적인 변화가 찾아왔나요?"
            ],
            examples: [
    [
        "예시 1: \"1년 반 동안 매일 기타를 연습해서 좋아하는 노래를 완주할 수 있게 되었어요. 처음엔 코드 하나 잡는 것도 어려웠는데, 이제는 친구들 앞에서 연주할 수 있게 되었습니다.\"",
        "예시 2: \"8개월 동안 매일 영어 회화 공부를 해서 해외여행에서 현지인과 자연스럽게 대화할 수 있게 되었어요. 하루도 빠지지 않고 30분씩 공부했습니다.\"",
        "예시 3: \"2년 동안 조금씩 준비해서 자격증을 취득했어요. 직장 다니면서 공부하는 게 힘들었지만, 매일 출퇴근 시간을 활용해서 꾸준히 했습니다.\""
    ],
    [
        "예시 1: \"포기하지 않는 끈기와 매일 조금씩이라도 꾸준히 하는 성실함이 도움이 되었어요. 그리고 작은 발전도 스스로 인정해주는 긍정적인 마음가짐도 중요했습니다.\"",
        "예시 2: \"목표를 세분화해서 단계별로 접근하는 계획성과, 매일 루틴을 지키는 자기 관리 능력이 큰 힘이 되었어요.\"",
        "예시 3: \"시간 관리 능력과 우선순위를 명확히 하는 능력이 도움이 되었어요. 그리고 미래의 목표를 위해 현재의 편안함을 포기할 수 있는 의지력도 중요했습니다.\""
    ],
    [
        "예시 1: \"음악이 제 삶에 큰 즐거움이 되었어요. 스트레스를 해소하는 방법도 생겼고, 사람들과 함께 즐길 수 있는 취미가 생겨서 인간관계도 더 풍부해졌습니다.\"",
        "예시 2: \"자신감이 많이 늘었어요. '꾸준히 하면 뭐든 할 수 있다'는 믿음이 생겨서 다른 일에도 더 적극적으로 도전하게 되었습니다.\"",
        "예시 3: \"전문성을 갖춘다는 것의 의미를 알게 되었어요. 그리고 꾸준함이 가져다주는 성취감을 경험하면서 자기계발에 대한 동기가 더욱 강해졌습니다.\""
    ]
],
        },
        {
            id: 7,
            category: "경험탐구",
            type: "용기있는시도",
            title: "용기를 내어 새로운 시도",
            questions: [
                "일상에서 평소 나라면 주저 했을 법한 작은 일에 용기를 내어 시도해본 경험이 있나요?(예: 새로운 길로 가보기, 평소 안 하던 스타일 시도해보기 등) 어떤 경험 이었나요?",
                "당신에게 존재하는 어떤 면이 발휘되어 용기를 낼 수 있었을까요?",
                "그 경험을 통해 나 자신이나 나의 강점, 내적인 매력에 대해 새롭게 느끼거나 깨닫게 된 점이 있나요?"
            ],
            examples: [
    [
        "예시 1: \"평소에는 항상 같은 길로 다녔는데, 어느 날 새로운 길로 가보고 싶어서 일부러 다른 경로로 집에 갔어요. 그랬더니 예쁜 카페와 작은 공원을 발견하게 되었습니다.\"",
        "예시 2: \"보통은 무난한 옷만 입었는데, 친구가 추천한 평소와 다른 스타일의 옷을 용기 내서 입어보았어요. 처음엔 어색했지만 생각보다 잘 어울린다는 말을 들었습니다.\"",
        "예시 3: \"혼자서는 절대 안 가던 혼밥을 처음 해봤어요. 맛있다고 소문난 식당에 가고 싶었는데 함께 갈 사람이 없어서 용기 내서 혼자 가봤습니다.\""
    ],
    [
        "예시 1: \"호기심이 많은 성격과 새로운 것을 탐험하고 싶어하는 모험심이 발휘된 것 같아요. 그리고 일상에 변화를 주고 싶어하는 마음도 큰 역할을 했습니다.\"",
        "예시 2: \"변화를 두려워하지 않는 도전 정신과 다른 사람의 조언을 수용하는 열린 마음이 도움이 되었어요.\"",
        "예시 3: \"자립심과 독립적인 성향, 그리고 원하는 것을 위해서는 남의 시선을 의식하지 않는 당당함이 발휘된 것 같아요.\""
    ],
    [
        "예시 1: \"제가 생각보다 호기심이 많고 새로운 경험을 즐기는 사람이라는 걸 알게 되었어요. 그리고 작은 모험도 일상에 활력을 준다는 걸 느꼈습니다.\"",
        "예시 2: \"고정관념에 얽매이지 않고 새로운 모습을 시도할 수 있는 용기가 있다는 걸 발견했어요. 그리고 변화를 통해 새로운 매력을 찾을 수 있다는 것도 배웠습니다.\"",
        "예시 3: \"혼자서도 충분히 즐길 수 있는 자립적인 면이 있다는 걸 알게 되었어요. 그리고 원하는 것을 위해 용기를 낼 수 있는 의지력이 있다는 것도 깨달았습니다.\""
    ]
],
        },

        // 2. 가치관 탐색 질문 그룹들 (7개)
        {
            id: 8,
            category: "가치탐구",
            type: "소중한기준",
            title: "소중한 기준과 생각",
            questions: [
                "혹시 다른 건 몰라도 이것만큼은 꼭 지키고 싶다고 마음속으로 다짐하는, 당신만의 소중한 기준이나 생각이 있나요? 있다면 어떤 것인지 이야기해주세요.",
                "그런 기준이나 생각을 갖게 된 특별한 계기나, 영향을 받은 인물이 있다면 그 이야기를 들려주실 수 있나요?",
                "그 기준이나 생각이 당신의 삶에 긍정적인 영향을 줬다고 생각하시나요? 그렇다면 어떤 면에서 긍정적인 영향을 받았나요?"
            ],
            examples: [
    [
        "예시 1: \"저는 '정직함'을 가장 중요하게 생각해요. 어떤 상황에서든 거짓말은 하지 않으려고 노력하고, 실수를 했을 때도 솔직하게 인정하려고 합니다.\"",
        "예시 2: \"제 기준은 '타인에게 피해를 주지 않는 것'이에요. 제 행동이 다른 사람에게 어떤 영향을 미칠지 항상 먼저 생각하려고 해요.\"",
        "예시 3: \"저에게 가장 소중한 생각은 '어떤 상황에서도 배움을 멈추지 않는 것'입니다. 늘 새로운 것을 배우고 성장하고 싶어요.\""
    ],
    [
        "예시 1: \"어릴 때 거짓말을 해서 가족을 실망시켰던 경험이 있어요. 그때 정직의 중요성을 깨달았고, 할머니께서 '진실한 사람이 가장 아름답다'고 말씀해 주셨던 게 기억에 남아요.\"",
        "예시 2: \"고등학교 때 제 무심한 말로 친구가 상처받는 걸 봤어요. 그때부터 내 행동이 다른 사람에게 미치는 영향에 대해 깊이 생각하게 되었습니다.\"",
        "예시 3: \"존경하는 선생님이 '평생 학습하는 사람이 진정한 지식인'이라고 하셨어요. 그리고 책을 통해 다양한 위인들의 끊임없는 배움의 자세를 보면서 영감을 받았습니다.\""
    ],
    [
        "예시 1: \"정직하게 행동하려고 노력하니 주변 사람들이 저를 더 신뢰해 주는 것 같아요. 인간관계가 더 깊어졌고, 스스로도 마음이 편안해졌습니다.\"",
        "예시 2: \"덕분에 불필요한 갈등을 피할 수 있었고, 다른 사람들을 배려하는 마음이 더 커졌어요. 스스로도 더 편안해졌고요.\"",
        "예시 3: \"새로운 것을 배우면서 제 자신이 계속 성장하고 있다는 느낌을 받아요. 삶에 대한 호기심과 활력이 생겼습니다.\""
    ]
]
        },
        {
            id: 9,
            category: "가치탐구",
            type: "선택의갈등",
            title: "가치관의 갈등과 선택",
            questions: [
                "어떤 것을 선택해야 할지, 마음속에서 중요하다고 생각하는 두 가지가 부딪혔던 순간이 있었나요? 그때 어떤 상황이었는지 알려주세요.",
                "그때 어떤 고민들을 하셨고, 결국 어떤 마음으로 하나의 선택을 내리셨는지 궁금해요.",
                "그 결정을 내리는 데 당신이 중요시여기는 가치 중 어떤 점이 가장 큰 영향을 주었다고 생각하시나요?"
            ],
            examples: [
    [
        "예시 1: \"회사에서 중요한 프로젝트 마감일과 가장 친한 친구의 결혼식이 겹쳤을 때 정말 고민됐어요. 둘 다 저에게 너무 중요했거든요.\"",
        "예시 2: \"팀 과제를 할 때, 제 의견과 팀원들의 의견이 정면으로 부딪혔어요. 제 아이디어가 더 좋다고 생각했지만, 팀워크를 해치고 싶지는 않았습니다.\"",
        "예시 3: \"안정적인 직장을 계속 다닐지, 아니면 평소 꿈꿔왔던 분야로 새롭게 도전할지 결정해야 했을 때, 마음이 복잡했습니다.\""
    ],
    [
        "예시 1: \"정말 많은 고민을 했어요. 결국 친구의 결혼식에 참석하기로 했습니다. 프로젝트는 미리 최선을 다해 준비하고, 동료들에게 사정을 설명해서 이해를 구했어요.\"",
        "예시 2: \"팀원들과 충분히 토론한 후, 서로의 의견을 절충할 수 있는 방안을 찾았어요. 완벽하지는 않았지만 모두가 수긍할 수 있는 결과를 만들었습니다.\"",
        "예시 3: \"신중하게 고민한 끝에 도전을 선택했어요. 안정성보다는 제 꿈과 성장 가능성에 더 큰 가치를 두기로 했습니다.\""
    ],
    [
        "예시 1: \"인간관계와 우정을 소중히 여기는 가치관이 가장 큰 영향을 주었어요. 일은 다시 할 수 있지만, 소중한 사람의 인생의 중요한 순간은 다시 오지 않으니까요.\"",
        "예시 2: \"협력과 소통을 중시하는 가치관이 결정에 큰 영향을 주었어요. 혼자만 옳다고 주장하는 것보다 함께 만들어가는 과정이 더 중요하다고 생각했습니다.\"",
        "예시 3: \"개인의 성장과 자아실현을 중요하게 여기는 가치관이 결정적인 역할을 했어요. 안전함보다는 도전과 발전을 택한 것이죠.\""
    ]
],
        },
        {
            id: 10,
            category: "가치탐구",
            type: "대인관계태도",
            title: "대인관계에서의 소중한 태도",
            questions: [
                "다른 사람들을 대할 때, 당신이 가장 중요하게 여기고 '이렇게 해야지' 하고 지키려고 하는 생각이나 태도가 있으신가요?",
                "그러한 생각이나 태도를 갖게 된 특별한 이유나 계기가 있을까요?",
                "그런 마음가짐을 잘 지키는 당신 자신을 볼 때, 스스로 '나 이런 점은 괜찮네!' 하고 느끼는 자신의 내적인 매력은 무엇인가요?"
            ],
            examples: [
    [
        "예시 1: \"다른 사람과 대화할 때 '먼저 충분히 들어주자'는 생각을 항상 해요. 상대방이 하고 싶은 말을 다 할 수 있도록 기다려주려고 합니다.\"",
        "예시 2: \"누구를 만나든 '편견 없이 있는 그대로 받아들이자'는 마음가짐을 지키려고 해요. 첫인상이나 소문에 의존하지 않으려고 노력합니다.\"",
        "예시 3: \"사람들과 관계를 맺을 때 '진정성을 가지고 다가가자'는 원칙을 중요하게 여겨요. 겉치레보다는 진심을 전하려고 합니다.\""
    ],
    [
        "예시 1: \"어릴 때 제가 말하려고 할 때 다른 사람이 끼어들면 기분이 나빴던 기억이 있어요. 그래서 다른 사람도 그런 기분을 느끼지 않았으면 좋겠다고 생각하게 되었습니다.\"",
        "예시 2: \"과거에 저 자신도 겉모습으로 오해받았던 경험이 있어서, 다른 사람도 그런 상처를 받지 않았으면 좋겠다는 마음이 생겼어요.\"",
        "예시 3: \"존경하는 어른이 항상 진실한 모습으로 사람들을 대하는 것을 보고 감명받았어요. 그분처럼 가식 없는 사람이 되고 싶었습니다.\""
    ],
    [
        "예시 1: \"다른 사람을 배려하고 공감할 줄 아는 따뜻한 마음과, 인내심을 가지고 기다려줄 수 있는 성숙함이 제 매력인 것 같아요.\"",
        "예시 2: \"열린 마음과 포용력, 그리고 사람을 있는 그대로 받아들일 수 있는 넓은 시각이 제 장점이라고 생각해요.\"",
        "예시 3: \"솔직함과 진정성, 그리고 다른 사람에게 진심으로 다가갈 수 있는 용기와 따뜻함이 제 내적 매력인 것 같아요.\""
    ]
],
        },
        {
            id: 11,
            category: "가치탐구",
            type: "변화속다짐",
            title: "변화 속에서도 지킨 소중한 것",
            questions: [
                "인생의 큰 변화를 겪거나 예상치 못한 어려움 속에서도, '이것만은 꼭 놓치지 말아야지' 했던 소중한 생각이나 다짐이 있나요? 있다면 어떤 것이었나요?",
                "그 복잡하고 혼란스러운 상황에서도 그것을 꿋꿋이 지켜낼 수 있었던 당신의 내면의 힘은 무엇이었다고 생각하세요?"
            ],
            examples: [
    [
        "예시 1: \"대학교를 졸업하고 취업하면서 환경이 많이 바뀌었지만, '가족과의 시간을 소중히 하자'는 다짐만큼은 꼭 지키려고 했어요. 아무리 바빠도 일주일에 한 번은 가족과 식사하는 시간을 만들었습니다.\"",
        "예시 2: \"이사와 전학을 반복하면서 힘든 시기가 있었지만, '독서하는 습관만큼은 포기하지 말자'고 다짐했어요. 어떤 상황에서도 책을 읽는 시간을 확보하려고 노력했습니다.\"",
        "예시 3: \"직장을 바꾸면서 스트레스가 많았지만, '다른 사람에게 친절하게 대하자'는 원칙만큼은 절대 놓지 않으려고 했어요.\""
    ],
    [
        "예시 1: \"가족에 대한 사랑과 책임감, 그리고 소중한 것에 대한 우선순위를 명확히 아는 가치관이 힘이 되었던 것 같아요.\"",
        "예시 2: \"지식과 성장에 대한 갈망, 그리고 어떤 상황에서도 포기하지 않는 의지력이 저를 지탱해 주었어요.\"",
        "예시 3: \"다른 사람을 향한 기본적인 존중과 배려, 그리고 어려운 상황에서도 품위를 잃지 않으려는 신념이 큰 힘이 되었습니다.\""
    ]
],
        },
        {
            id: 12,
            category: "가치탐구", 
            type: "열정분야",
            title: "열정을 쏟는 분야",
            questions: [
                "혹시 시간 가는 줄 모르고 푹 빠져서 열정을 쏟는 분야나 활동이 있나요? 있다면 어떤 것인지 먼저 알려주세요.",
                "그토록 열정적으로 임하게 되는 이유나 당신에게 중요한 어떤 가치가 있으신가요?",
                "그럼 그 과정에서 당신이 발견하게 되는 자신의 강점이나, 매력은 무엇인가요?"
            ],
            examples: [
    [
        "예시 1: \"요리에 푹 빠져있어요. 새로운 레시피를 찾아보고, 재료를 고르고, 만들어서 사람들이 맛있게 먹는 모습을 보면 정말 행복해요. 시간 가는 줄 몰라요.\"",
        "예시 2: \"사진 찍는 것을 정말 좋아해요. 특히 자연 풍경이나 사람들의 자연스러운 모습을 담는 것에 열정을 쏟고 있어요. 주말이면 사진 찍으러 나가는 게 가장 즐거워요.\"",
        "예시 3: \"봉사활동에 시간과 에너지를 많이 투자하고 있어요. 도움이 필요한 사람들을 돕는 일에서 큰 보람과 의미를 느끼거든요.\""
    ],
    [
        "예시 1: \"다른 사람을 행복하게 해주는 것에서 가장 큰 보람을 느껴요. 그리고 창의성을 발휘할 수 있고, 끊임없이 새로운 것을 시도할 수 있어서 매력적이에요.\"",
        "예시 2: \"아름다운 순간을 영원히 보존할 수 있다는 것이 의미 있어요. 그리고 세상을 다른 관점에서 바라보며 감성을 표현할 수 있어서 좋아요.\"",
        "예시 3: \"사회에 기여하고 의미 있는 일을 한다는 가치가 중요해요. 그리고 인간에 대한 사랑과 공동체 의식을 실현할 수 있어서 열정을 갖게 되는 것 같아요.\""
    ],
    [
        "예시 1: \"창의력과 세심함, 그리고 다른 사람의 기쁨을 위해 노력하는 따뜻한 마음이 제 강점인 것 같아요. 또 완벽을 추구하는 성향도 도움이 되고 있어요.\"",
        "예시 2: \"관찰력과 미적 감각, 그리고 순간을 포착하는 집중력이 제 매력이라고 생각해요. 세상을 아름답게 바라보는 시각도 큰 장점이고요.\"",
        "예시 3: \"공감 능력과 이타적인 마음, 그리고 꾸준히 실천하는 의지력이 제 강점이에요. 사람들과 소통하는 능력도 이 일에 큰 도움이 되고 있습니다.\""
    ]
],
        },
        {
            id: 13,
            category: "가치탐구",
            type: "미래가치관",
            title: "앞으로 더 중요하게 여기고 싶은 가치",
            questions: [
                "지금도 충분히 멋지지만, 앞으로 당신의 삶에서 '이런 생각 혹은 마음가짐은 더 중요하게 여기고 싶다' 혹은 '이런 모습으로 살아가고 싶다'고 바라는 모습이 있나요?",
                "그것을 완전히 당신의 것으로 만들기 위해, 당신 안에 있는 어떤 잠재력이나 강점을 더 믿고 발전시켜나가고 싶으신가요?"
            ],
            examples: [
    [
        "예시 1: \"앞으로는 '균형잡힌 삶'을 더 중요하게 여기고 싶어요. 일과 휴식, 자신과 타인, 현재와 미래 사이의 조화를 잘 맞추며 살고 싶습니다.\"",
        "예시 2: \"'용기'를 더 중시하고 싶어요. 두려움 때문에 포기하지 않고, 옳다고 생각하는 일에 당당히 목소리를 낼 수 있는 사람이 되고 싶습니다.\"",
        "예시 3: \"'감사하는 마음'을 더욱 중요하게 여기고 싶어요. 당연하게 여겼던 일상의 소중함을 인식하고, 주변 사람들에게 고마움을 표현하는 삶을 살고 싶습니다.\""
    ],
    [
        "예시 1: \"지금 가지고 있는 계획성과 성실함을 바탕으로, 여기에 유연성과 창의적 사고를 더해서 진정한 균형감을 갖추고 싶어요.\"",
        "예시 2: \"원래 가지고 있는 신중함과 분석력을 유지하면서도, 더 과감하게 도전할 수 있는 실행력을 키우고 싶습니다.\"",
        "예시 3: \"이미 가지고 있는 공감 능력과 따뜻한 마음을 더욱 발전시켜서, 진심으로 감사를 표현할 수 있는 소통 능력을 키우고 싶어요.\""
    ]
],
        },
        {
            id: 14,
            category: "가치탐구",
            type: "결과수용",
            title: "결과를 담담하게 수용하는 태도",
            questions: [
                "어떤 일의 결과가 생각만큼 좋지 않았을 때, 그 상황을 다른 누구의 탓으로 돌리기보다 결과를 담담하게 마주했던 경험이 있나요? 그때 어떤 마음으로 상황을 받아들였는지 이야기해주세요.",
                "그렇게 상황과 결과를 받아드렸을 때의 경험이 당신에게 성장의 원동력이 되거나 숨겨진 모습의 발견으로 이어 졌었나요? 이어 졌다면 어떤 부분에서 성장하게 되었나요?"
            ],
            examples: [
    [
        "예시 1: \"중요한 면접에서 떨어졌을 때, 처음엔 실망스러웠지만 '이것도 하나의 과정이다'라고 받아들였어요. 누구를 탓하기보다는 부족했던 점을 분석해보려고 했습니다.\"",
        "예시 2: \"팀 프로젝트에서 제가 맡은 부분 때문에 전체 성과가 좋지 않았을 때, 변명하지 않고 솔직히 인정했어요. 그리고 어떻게 보완할지 생각해봤습니다.\"",
        "예시 3: \"열심히 준비한 공모전에서 수상하지 못했을 때, 아쉽긴 했지만 '배운 것이 많다'고 긍정적으로 생각하려고 했어요.\""
    ],
    [
        "예시 1: \"그 경험을 통해 실패를 두려워하지 않는 도전 정신이 더 강해졌어요. 그리고 객관적으로 자신을 돌아볼 수 있는 성찰 능력도 늘었습니다.\"",
        "예시 2: \"책임감과 정직함이 더욱 강화되었고, 문제 해결 능력도 향상되었어요. 실수를 통해 배우는 것이 얼마나 중요한지 깨달았습니다.\"",
        "예시 3: \"좌절을 성장의 기회로 전환하는 긍정적 사고력이 늘었어요. 그리고 과정 자체에서 의미를 찾는 성숙한 관점을 갖게 되었습니다.\""
    ]
],
        },

        // 3. 성장 탐구 질문 그룹들 (8개)
        {
            id: 15,
            category: "성장탐구",
            type: "바라는성장",
            title: "바라는 성장의 모습",
            questions: [
                "앞으로 1년 뒤, 혹은 조금 더 먼 미래에 '아, 나 정말 성장 했구나'라고 느끼고 싶은, 당신이 가장 바라는 성장한 모습은 어떤 모습인가요?",
                "그 멋진 모습을 현실로 만들기 위해, 지금 당신 안에 있는 어떤 강점이나 잠재력을 더 발전시키고 싶으신가요?"
            ],
            examples: [
    [
        "예시 1: \"1년 뒤에는 지금보다 좀 더 자신감 있는 모습이었으면 좋겠어요. 새로운 일에 도전하는 것을 두려워하지 않는 사람이요.\"",
        "예시 2: \"조금 더 먼 미래에는 제 감정을 잘 다스리고 다른 사람의 이야기를 더 깊이 이해하는, 정서적으로 성숙한 사람이 되고 싶어요.\"",
        "예시 3: \"제가 하는 일에서 전문성을 인정받고, 다른 사람에게 도움을 줄 수 있는 영향력 있는 사람이 되었으면 합니다.\""
    ],
    [
        "예시 1: \"도전하는 것을 두려워하지 않기 위해, 지금 가진 '호기심'과 '새로운 것을 배우려는 의지'를 더 키우고 싶어요.\"",
        "예시 2: \"다른 사람을 더 잘 이해하기 위해, 지금도 노력하고 있는 '경청하는 태도'와 '공감 능력'을 더 발전시키고 싶습니다.\"",
        "예시 3: \"전문성을 키우기 위해, 지금 제가 가진 '성실함'과 '문제 해결 능력'을 더욱 갈고 닦고 싶어요. 꾸준히 노력하는 거죠.\""
    ]
],
        },
        {
            id: 16,
            category: "성장탐구",
            type: "새로운배움",
            title: "새롭게 배우고 싶은 분야",
            questions: [
                "만약 무엇이든 새롭게 배울 수 있는 충분한 시간과 기회가 주어진다면, 가장 먼저 배우거나 경험해보고 싶은 분야는 무엇인가요?",
                "그것을 배우고 싶은 가장 큰 이유는 당신의 어떤 점(예: 지금 가진 장점을 더 키우고 싶어서, 아니면 새로운 가능성을 열고 싶어서) 때문인가요?",
                "그 배움이 당신의 어떤 내적인 강점을 채워줄 수 있을 거라고 생각하시나요?"
            ],
            examples: [
    [
        "예시 1: \"코딩을 한번 제대로 배워보고 싶어요. 직접 간단한 앱이라도 만들어보고 싶거든요.\"",
        "예시 2: \"예전부터 심리학에 관심이 많았는데, 기회가 된다면 심리학을 체계적으로 공부해보고 싶습니다.\"",
        "예시 3: \"멋진 풍경 사진을 찍는 법을 배우고 싶어요. 여행 다니면서 아름다운 순간들을 직접 기록하고 싶습니다.\""
    ],
    [
        "예시 1: \"논리적 사고력을 더 키우고 싶어서요. 그리고 창의적인 문제 해결 능력도 개발하고 싶습니다.\"",
        "예시 2: \"원래 가지고 있는 공감 능력을 더 전문적으로 발전시키고 싶어요. 사람을 더 깊이 이해할 수 있게 되고 싶습니다.\"",
        "예시 3: \"미적 감각과 관찰력을 더 키우고 싶어서요. 그리고 순간을 포착하는 집중력도 향상시키고 싶습니다.\""
    ],
    [
        "예시 1: \"체계적이고 논리적인 사고 과정을 배우면서 제 분석력과 문제 해결 능력이 더욱 체계화될 것 같아요.\"",
        "예시 2: \"인간의 마음을 이해하는 전문 지식을 얻으면서, 제 타고난 공감 능력이 더욱 깊이 있고 도움이 되는 방향으로 발전할 것 같습니다.\"",
        "예시 3: \"예술적 감각과 기술적 스킬을 배우면서, 제 관찰력과 감성이 더욱 세련되고 표현력 있게 발전할 것 같아요.\""
    ]
],
        },
        {
            id: 17,
            category: "성장탐구",
            type: "개선하고싶은점",
            title: "개선하고 싶은 나의 모습",
            questions: [
                "지금 당신의 모습 중에서, '이 부분은 앞으로 이렇게 더 좋아지면 좋겠다'고 스스로 변화를 바라는 지점이 있다면 어떤 것인가요?",
                "만약 그 부분이 당신이 바라는 대로 긍정적으로 변화한다면, 당신의 일상이나 마음은 어떻게 달라질 것 같나요?",
                "만약 그 부분의 변화로 인해 잃게 될 수도 있는 현재의 장점에 대해 생각해 보셨나요? 내가 바라는 변화로 인해 잃게 될지도 모르는 현재 내가 가지고 있는 장점에 대해 작성해주세요"
            ],
            examples: [
    [
        "예시 1: \"저는 너무 생각이 많은 편이라 결정을 빨리 못 내릴 때가 많아요. 그래서 좋은 기회를 놓칠 때도 있고요.\"",
        "예시 2: \"낯을 많이 가려서 새로운 사람들과 쉽게 친해지지 못하는 게 아쉬워요. 가끔은 외롭다고 느낄 때도 있습니다.\"",
        "예시 3: \"한번 화가 나면 감정 조절이 잘 안 될 때가 있어요. 그래서 나중에 후회할 말을 하기도 하고요.\""
    ],
    [
        "예시 1: \"결정을 더 빠르게 내릴 수 있게 되면, 더 많은 기회를 잡을 수 있을 것 같아요. 그리고 스트레스도 줄어들고 더 활동적인 삶을 살 수 있을 것 같습니다.\"",
        "예시 2: \"사교성이 늘어나면 더 다양한 사람들과 의미 있는 관계를 맺을 수 있을 것 같아요. 인생이 더 풍부해질 것 같습니다.\"",
        "예시 3: \"감정 조절을 잘할 수 있게 되면 인간관계가 더 원만해질 것 같아요. 그리고 스스로도 더 평온한 마음으로 살 수 있을 것 같습니다.\""
    ],
    [
        "예시 1: \"신중하고 꼼꼼한 성격은 제 큰 장점인데, 빠른 결정력을 기르려다가 이런 신중함을 잃을 수도 있겠네요. 깊이 있게 고민하는 능력을 놓치고 싶지는 않아요.\"",
        "예시 2: \"지금의 차분하고 진중한 매력을 잃을 수도 있을 것 같아요. 그리고 깊이 있는 관계를 맺는 능력도 사라질까 걱정됩니다.\"",
        "예시 3: \"열정적이고 솔직한 면도 제 매력인데, 감정을 너무 억제하다 보면 진정성이나 열정이 사라질 수도 있을 것 같아요.\""
    ]
],
        },
        {
            id: 18,
            category: "성장탐구",
            type: "좋은영향",
            title: "세상에 주고 싶은 좋은 영향",
            questions: [
                "앞으로 당신이 주변 사람들이나 세상에 좋은 영향을 주고 싶다는 생각을 해본 적 있나요? 있다면 어떤 영향인가요?",
                "그러한 영향을 주기 위해, 당신이 이미 가지고 있거나 더욱 발전시키고 싶은 좋은 면이나 뛰어난 능력은 무엇인가요?",
                "그 매력을 어떤 멋진 방식으로 활용하여 좋은 영향을 주고 싶으신가요?"
            ],
            examples: [
    [
        "예시 1: \"주변 사람들이 자신감을 갖고 더 행복하게 살 수 있도록 도움을 주고 싶어요. 특히 자신의 가치를 잘 모르는 사람들에게 힘이 되고 싶습니다.\"",
        "예시 2: \"환경 보호에 관심이 많아서, 작은 것부터 실천하며 사람들에게 환경의 소중함을 알리고 싶어요. 지구를 더 깨끗하게 만드는 데 기여하고 싶습니다.\"",
        "예시 3: \"교육 격차 해소에 관심이 있어요. 배움의 기회가 부족한 아이들에게 지식을 나누고, 꿈을 키울 수 있도록 도움을 주고 싶습니다.\""
    ],
    [
        "예시 1: \"공감 능력과 따뜻한 마음, 그리고 다른 사람의 장점을 찾아주는 능력을 더욱 발전시키고 싶어요.\"",
        "예시 2: \"환경에 대한 지식과 실천력, 그리고 사람들을 설득하고 동기부여할 수 있는 리더십을 키우고 싶습니다.\"",
        "예시 3: \"가르치는 능력과 인내심, 그리고 아이들과 소통할 수 있는 친화력을 더욱 발전시키고 싶어요.\""
    ],
    [
        "예시 1: \"상담이나 코칭을 통해서 사람들이 자신의 잠재력을 발견할 수 있도록 도와주고 싶어요. 한 사람 한 사람이 더 빛날 수 있게 말이에요.\"",
        "예시 2: \"환경 보호 캠페인이나 친환경 제품 개발에 참여해서 더 많은 사람들이 환경 보호에 동참할 수 있도록 하고 싶어요.\"",
        "예시 3: \"멘토링 프로그램이나 교육 봉사를 통해서 아이들이 꿈을 포기하지 않고 계속 도전할 수 있도록 응원하고 싶습니다.\""
    ]
],
        },
        {
            id: 19,
            category: "성장탐구",
            type: "타인으로부터배움",
            title: "타인으로부터 배우고 싶은 점",
            questions: [
                "혹시 최근에 다른 사람의 모습이나 행동을 보면서 '아, 나도 저런 점은 배우고 싶다!' 또는 '참 괜찮다'라고 마음속으로 생각했던 순간이 있나요?",
                "그 사람의 어떤 매력이 당신에게 그런 생각을 하게 만들었나요?",
                "만약 그 좋은 점을 당신의 것으로 만들고 싶다면, 어떤 작은 시도부터 해볼 수 있을까요?"
            ],
            examples: [
    [
        "예시 1: \"회사 선배가 어떤 상황에서도 항상 침착하고 여유로운 모습을 보이는 걸 보고 '나도 저런 평정심을 갖고 싶다'고 생각했어요.\"",
        "예시 2: \"친구가 새로운 것에 도전할 때 두려움 없이 과감하게 시작하는 모습을 보고 부러웠어요. 그런 용기와 추진력을 배우고 싶어요.\"",
        "예시 3: \"카페에서 본 직원분이 바쁜 중에도 손님들에게 항상 밝고 진심어린 미소를 보이는 걸 보고 감동받았어요. 그런 긍정적인 에너지를 배우고 싶습니다.\""
    ],
    [
        "예시 1: \"어떤 상황에서도 흔들리지 않는 내면의 평정심과, 감정을 잘 조절할 수 있는 성숙함이 정말 매력적이었어요.\"",
        "예시 2: \"실패를 두려워하지 않는 용기와, 새로운 것에 대한 열린 마음가짐, 그리고 빠른 실행력이 인상적이었습니다.\"",
        "예시 3: \"힘든 상황에서도 다른 사람을 배려할 수 있는 마음의 여유와, 진정성 있는 친절함이 정말 아름다웠어요.\""
    ],
    [
        "예시 1: \"작은 것부터 시작해보려고 해요. 스트레스 받는 상황에서 일단 심호흡을 하고 한 번 더 생각해보는 습관을 만들어보고 싶어요.\"",
        "예시 2: \"관심 있었던 새로운 취미 하나를 선택해서, 완벽하지 않더라도 일단 시작해보는 것부터 해보려고 해요.\"",
        "예시 3: \"매일 만나는 사람들에게 진심으로 관심을 갖고 따뜻한 말 한마디씩 건네는 작은 실천부터 시작해보고 싶어요.\""
    ]
],
        },
        {
            id: 20,
            category: "성장탐구",
            type: "외부평가영향",
            title: "외부 평가의 영향과 내면의 목소리",
            questions: [
                "혹시 다른 사람들의 반응이나 평가(예: 칭찬이나 아쉬운 소리 등)에 따라 나의 기분이나 나 자신에 대한 생각이 크게 영향을 받는다고 느낄 때가 있나요? 있다면 주로 어떤 경우에 그런 것 같나요?",
                "그렇다면, 외부의 시선 때문에 스스로 충분히 인정해주지 못했지만, '사실 이건 내가 정말 잘하는 부분인데' 혹은 '이런 내 모습이 나는 참 괜찮은데' 하고 생각해봤던 나만의 강점이나 매력이 있나요?",
                "앞으로 다른 사람의 평가보다는 당신 스스로의 목소리에 더 귀 기울여 그 매력을 믿고 키워나간다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ],
            examples: [
    [
        "예시 1: \"칭찬을 받으면 기분이 너무 좋아지고, 비판을 받으면 하루 종일 그 말이 머릿속에 맴돌아요. 특히 친한 사람들의 평가에 마음이 많이 흔들리는 것 같아요.\"",
        "예시 2: \"SNS에 올린 게시물의 '좋아요' 수나 댓글 반응을 보고 제 기분이 달라지는 걸 느낄 때가 있어요. 반응이 좋으면 자신감이 생기고, 별로면 위축되고요.\"",
        "예시 3: \"발표나 회의에서 제 의견에 대한 반응을 보고 '내가 잘못 생각한 건가?' 싶어서 자신감이 떨어질 때가 있어요.\""
    ],
    [
        "예시 1: \"저는 사실 계획을 세우고 차근차근 실행하는 걸 좋아하는데, 다른 사람들이 '너무 신중하다'고 할 때가 있어요. 하지만 이런 신중함 덕분에 실수를 줄일 수 있다고 생각해요.\"",
        "예시 2: \"조용한 성격이라서 '더 적극적이어야 한다'는 말을 자주 들어요. 하지만 저는 깊이 있게 생각하고 관찰하는 능력이 있다고 생각하거든요.\"",
        "예시 3: \"완벽주의 성향 때문에 '너무 꼼꼼하다'는 소리를 들어요. 하지만 이 덕분에 퀄리티 높은 결과를 만들어낼 수 있다고 생각해요.\""
    ],
    [
        "예시 1: \"제 신중함을 인정하고 믿는다면, 결정을 내릴 때 더 자신 있게 할 수 있을 것 같아요. 그리고 제 방식대로 해도 괜찮다는 확신을 가질 수 있을 것 같습니다.\"",
        "예시 2: \"제 관찰력과 깊이 있는 사고를 믿는다면, 다른 사람들과 다른 방식으로 소통해도 괜찮다는 자신감을 가질 수 있을 것 같아요.\"",
        "예시 3: \"제 꼼꼼함이 장점이라고 인정한다면, 다른 사람의 속도에 맞추려고 급하게 하지 않고 제 페이스대로 해도 된다는 마음의 여유를 가질 수 있을 것 같아요.\""
    ]
],
        },
        {
            id: 21,
            category: "성장탐구",
            type: "자기엄격성",
            title: "스스로에게 엄격한 모습",
            questions: [
                "스스로에게 너무 엄격해서, 다른 사람이 보기엔 충분히 괜찮거나 좋은 점인데도 '이건 별거 아니야'라며 넘겨버리거나 스스로 낮춰 보았던 모습이나 생각있나요? 있다면 어떤 부분인가요?",
                "만약 그런 당신의 좋은 점을 충분히 인정해주지 못했다면, 그 이유는 무엇이었을까요? (예: 과거의 경험, 타인의 평가, 완벽주의 성향 등)",
                "이제 그 '별거 아니라고 생각했던' 당신의 그 모습을 제대로 인식하고 '소중한 매력'으로 인정해준다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ],
            examples: [
    [
        "예시 1: \"친구들이 제 요리를 맛있다고 칭찬해줘도 '이건 그냥 레시피 따라 한 거라 별거 아니야'라고 생각해버려요. 스스로 대수롭지 않게 넘겨버리는 경우가 많아요.\"",
        "예시 2: \"팀 프로젝트에서 제 역할을 끝내고 다른 사람들 것도 자연스럽게 도와주는데, 동료들이 '너는 왜 이렇게 세심하게 챙겨주냐'고 고마워해요. 저는 당연한 거라고 생각했는데요.\"",
        "예시 3: \"발표를 잘 했다고 칭찬받아도 '준비를 더 많이 했어야 했는데'라고 아쉬워하는 편이에요. 항상 부족한 점만 보게 되더라고요.\""
    ],
    [
        "예시 1: \"어릴 때부터 '이 정도로는 안 된다'는 생각이 강했어요. 부모님이 완벽주의 성향이 있으셨고, 저도 자연스럽게 높은 기준을 갖게 된 것 같아요.\"",
        "예시 2: \"과거에 실수했던 경험들이 있어서, 그때의 부끄러움이 지금도 영향을 주는 것 같아요. '또 실수하면 어떡하지' 하는 두려움이 있어요.\"",
        "예시 3: \"주변에 정말 뛰어난 사람들이 많다 보니, 상대적으로 제 능력이 별거 아닌 것처럼 느껴질 때가 있어요. 비교하는 습관이 생긴 것 같아요.\""
    ],
    [
        "예시 1: \"제 요리 실력을 인정해준다면, 친구들을 더 자주 초대해서 즐거운 시간을 만들 수 있을 것 같아요. 스스로에게 더 자신감을 가질 수 있을 거예요.\"",
        "예시 2: \"제 배려심을 매력으로 인정한다면, 다른 사람을 도울 때 더 당당하고 기쁜 마음으로 할 수 있을 것 같아요. 지금처럼 '이게 뭐 대단한 일이야' 하고 넘기지 않을 거예요.\"",
        "예시 3: \"완벽하지 않아도 괜찮다는 걸 받아들인다면, 새로운 도전을 할 때 더 용기를 낼 수 있을 것 같아요. 실패를 두려워하지 않고 더 자유롭게 살 수 있을 거예요.\""
    ]
],
        },
        {
            id: 22,
            category: "성장탐구",
            type: "반전매력",
            title: "아쉬운 점의 반전 매력",
            questions: [
                "혹시 스스로 생각하기에 '이건 나의 아쉬운점 이야' 또는 '이것 때문에 가끔 손해를 보거나 힘들어'라고 여기는 당신의 어떤 모습이나 성향이 있나요? 있다면 어떤 부분인지 편하게 이야기해주세요.",
                "그렇다면, 그 '아쉬운 점'이라고 생각했던 모습이 혹시 다른 상황이나 다른 관점에서 보면 오히려 긍정적인 역할을 하거나, 더 좋은 결과를 만들 수 있는 가능성에 대해 생각해 본 적 있나요? (예를 들어, '너무 생각이 많아 결정을 못 한다'는 것이 '신중하고 다각도로 고민한다'는 것일 수도 있는 것처럼요.)",
                "만약 당신의 그 '아쉬운 점' 이면에 숨겨진 긍정적인 면이나 가능성을 발견한다면, 그것을 당신의 새로운 '반전 매력'과 같은 이름을 붙여 인정해준다면, 당신의 일상이나 자신을 바라보는데에 어떤 변화가 찾아올 것이라고 생각하시나요?"
            ],
            examples: [
    [
        "예시 1: \"저는 결정을 너무 오래 고민하는 편이에요. 메뉴 하나 정하는 것도 한참 걸리고, 옷 하나 사는 것도 며칠씩 고민해요. 친구들이 답답해할 때가 있어요.\"",
        "예시 2: \"남들 눈치를 너무 많이 보는 것 같아요. 제 의견을 말할 때도 '이렇게 말하면 기분 나빠하지 않을까' 하고 계속 생각하게 돼요.\"",
        "예시 3: \"감정이 얼굴에 다 드러나는 편이에요. 속마음을 숨기는 게 어려워서 때로는 불리할 때도 있고, 어른스럽지 못하다는 생각이 들어요.\""
    ],
    [
        "예시 1: \"생각해보니 제가 신중하게 고민한 덕분에 큰 실수를 피한 경우가 많았어요. 친구가 '네가 한 번 더 생각해보자고 해서 정말 다행이었다'고 말한 적도 있고요.\"",
        "예시 2: \"눈치를 보는 것도 사실은 다른 사람의 감정을 세심하게 배려하는 거잖아요. 덕분에 갈등 상황을 미리 예방하거나 분위기를 부드럽게 만든 경우가 많았어요.\"",
        "예시 3: \"감정이 드러나는 게 오히려 사람들이 저를 신뢰하는 이유인 것 같아요. '너는 진짜 마음이 따뜻한 게 느껴진다'고 말해주는 사람들이 있거든요.\""
    ],
    [
        "예시 1: \"제 '신중함'을 매력으로 인정한다면, 중요한 결정을 할 때 더 자신 있게 시간을 가질 수 있을 것 같아요. 성급하게 결정해서 후회하는 일도 줄어들 거예요.\"",
        "예시 2: \"제 '배려심'이 매력이라고 생각한다면, 다른 사람을 위해 신경 쓰는 제 자신을 더 좋아하게 될 것 같아요. 지금처럼 '왜 이렇게 눈치를 보지?' 하고 자책하지 않을 거예요.\"",
        "예시 3: \"제 '진솔함'을 인정해준다면, 감정을 숨기려고 애쓰지 않고 더 자연스럽게 사람들과 소통할 수 있을 것 같아요. 진짜 저다운 매력을 발휘할 수 있을 거예요.\""
    ]
],
        },

        // 4. 관계 탐구 질문 그룹들 (7개)
        {
            id: 23,
            category: "관계탐구",
            type: "새로운만남",
            title: "새로운 사람들과의 만남",
            questions: [
                "새로운 사람들을 만나거나 여러 사람이 모인 자리에서, 어색함을 풀고 자연스럽게 대화를 시작하는 당신만의 특별한 방법이 있나요? 있다면 어떤 것인가요?",
                "그런 당신의 먼저 다가가는 용기나 다른 사람을 편안하게 해주는 능력 덕분에 좋은 관계로 발전했던 경험이 있다면 이야기해주세요."
            ],
            examples: [
    [
        "예시 1: \"처음 만나는 사람들 앞에서는 먼저 밝게 인사하고, 상대방이 어색해하지 않도록 가벼운 농담이나 칭찬으로 분위기를 풀어요. '오늘 날씨 정말 좋네요' 같은 자연스러운 화젯거리로 시작하는 편이에요.\"",
        "예시 2: \"새로운 모임에서는 조용히 앉아있는 사람을 찾아서 먼저 말을 걸어요. '혹시 처음 오셨어요? 저도 처음인데 같이 얘기해요' 하면서 자연스럽게 대화를 시작하죠.\"",
        "예시 3: \"공통 관심사를 빨리 찾아내는 편이에요. 상대방이 뭘 좋아하는지 물어보고, 비슷한 경험이 있으면 그 이야기로 대화를 이어가요.\""
    ],
    [
        "예시 1: \"대학교 동아리에서 처음 온 신입생이 어색해하고 있길래 먼저 다가가서 대화를 나눴어요. 나중에 그 친구가 '덕분에 동아리에 잘 적응할 수 있었다'고 고마워했고, 지금까지도 좋은 친구로 지내고 있어요.\"",
        "예시 2: \"회사 워크숍에서 혼자 있던 타 부서 직원분께 먼저 말을 걸었어요. 알고 보니 업무적으로도 협력할 일이 많아서, 그때의 인연으로 지금도 서로 도움을 주고받는 관계가 되었어요.\"",
        "예시 3: \"여행지에서 만난 다른 여행객과 자연스럽게 대화를 나누다가, 함께 식사도 하고 여행 코스도 공유하게 되었어요. 지금도 SNS로 연락하며 서로의 근황을 나누고 있어요.\""
    ]
],
        },
        {
            id: 24,
            category: "관계탐구",
            type: "분위기전환",
            title: "분위기를 긍정적으로 전환하는 능력",
            questions: [
                "혹시 조금 무겁거나 어색했던 분위기를 당신의 재치 있는 말이나 행동으로 기분 좋게 전환했던 경험이 있나요? 그때 어떤 상황이었는지 먼저 들려주세요.",
                "그 순간, 당신의 어떤 장점이나 매력이 빛을 발했고, 그 덕분에 분위기가 어떻게 긍정적으로 바뀌었나요?"
            ],
            examples: [
    [
        "예시 1: \"팀 회의에서 의견 충돌로 분위기가 차갑게 얼어붙었을 때, '잠깐, 우리 모두 같은 목표를 위해 열심히 고민하고 있는 거잖아요. 이렇게 다양한 의견이 나오는 것 자체가 좋은 신호인 것 같은데요?'라고 말했어요.\"",
        "예시 2: \"친구들과 식당에서 주문한 음식이 너무 늦게 나와서 모두 짜증이 났을 때, '이렇게 오래 기다리는 것도 추억이겠다. 나중에 이 날 얘기하면서 웃을 수 있을 거야'라고 말하며 분위기를 바꿨어요.\"",
        "예시 3: \"동아리 발표 준비 중에 실수가 연달아 일어나서 모두 의기소침해졌을 때, '완벽한 리허설보다 실수투성이 리허설이 더 도움 된다던데? 이제 실제로는 실수 안 할 거야!'라고 말했어요.\""
    ],
    [
        "예시 1: \"그 순간 제가 가진 '긍정적인 시각으로 상황을 재해석하는 능력'이 빛을 발했던 것 같아요. 덕분에 팀원들이 다시 웃음을 찾고, 건설적인 토론으로 이어질 수 있었어요.\"",
        "예시 2: \"평소 제가 스트레스 상황에서도 유머를 찾으려고 노력하는 성격이 도움이 되었어요. 친구들이 '너 덕분에 기다리는 시간이 지루하지 않았다'고 말해줬어요.\"",
        "예시 3: \"제가 가진 '실패를 성장의 기회로 보는 마인드'가 다른 사람들에게도 전해진 것 같아요. 결국 실제 발표는 대성공이었고, 모두가 그 과정을 소중한 경험으로 기억하게 되었어요.\""
    ]
],
        },
        {
            id: 25,
            category: "관계탐구",
            type: "약속과책임",
            title: "약속과 책임을 지키는 마음",
            questions: [
                "친구와의 약속을 지키거나 단체 활동에서 맡은 역할에 책임을 다하는 것이 당신에게 중요한가요? 그 이유는 무엇인가요?",
                "혹시 어려운 상황에서도 그 약속이나 책임을 끝까지 지키려고 노력했던 경험이 있다면, 그 경험을 통해 스스로 발견하게 된 당신의 강점은 무엇이었나요?"
            ],
            examples: [
    [
        "예시 1: \"친구와의 약속은 정말 소중하다고 생각해요. 작은 약속이라도 지키지 않으면 신뢰가 깨진다고 생각하거든요. 상대방이 저를 믿고 시간을 내준 건데, 그 마음을 소중히 여기고 싶어요.\"",
        "예시 2: \"팀에서 맡은 역할은 다른 사람들이 저를 믿고 맡겨준 거라고 생각해요. 제가 책임을 다하지 못하면 팀 전체에 피해를 주잖아요. 그런 일은 절대 있어서는 안 된다고 생각해요.\"",
        "예시 3: \"약속을 지키는 것은 저 자신과의 약속이기도 해요. 한 번 말한 건 반드시 실행하는 사람이 되고 싶거든요. 그래야 스스로를 존중할 수 있을 것 같아요.\""
    ],
    [
        "예시 1: \"몸이 아파서 친구와의 약속을 취소하고 싶었지만, 그 친구가 저를 만나기 위해 멀리서 온다는 걸 알고 있어서 끝까지 나갔어요. 그때 제가 얼마나 약속을 소중히 여기는지 깨달았어요.\"",
        "예시 2: \"동아리에서 행사 준비를 맡았는데, 개인적으로 바쁜 일이 생겼어요. 하지만 다른 사람들이 저를 믿고 있다는 생각에 밤늦게까지 준비를 완료했어요. 그 과정에서 제 책임감이 얼마나 강한지 알게 되었어요.\"",
        "예시 3: \"아르바이트를 하면서 힘든 날이 많았지만, 사장님과 동료들에게 폐를 끼치고 싶지 않아서 끝까지 성실하게 일했어요. 덕분에 '믿을 수 있는 사람'이라는 평가를 받을 수 있었어요.\""
    ]
],
        },
        {
            id: 26,
            category: "관계탐구",
            type: "다른관점수용",
            title: "다른 관점을 수용하는 태도",
            questions: [
                "나와 생각이 아주 다른 사람과 의견을 나누어야 할 때 그때 상대방의 입장을 이해하고 존중하며 대화를 이끌어가기 위해 노력을 해본 경험이 있나요?",
                "다른 관점을 받아들이고 함께 좋은 대화를 만들려고 할 때, 당신의 어떤 태도나 자세가 도움이 되었다고 생각하세요?"
            ],
            examples: [
    [
        "예시 1: \"정치적인 견해가 완전히 다른 친구와 대화할 때가 있어요. 처음에는 답답했지만, '이 친구는 왜 이렇게 생각하게 되었을까?'라고 궁금해하며 그 배경을 들어보려고 노력해요.\"",
        "예시 2: \"팀 프로젝트에서 제 아이디어와 정반대되는 의견이 나왔을 때, 즉시 반박하지 않고 '그 방법의 장점이 뭘까요?'라고 물어보며 상대방의 관점을 이해하려고 해요.\"",
        "예시 3: \"가족들과 진로 문제로 의견이 다를 때, '부모님은 제 걱정을 해주시는 거구나'라고 생각하며 그분들의 마음을 먼저 이해하려고 노력해요.\""
    ],
    [
        "예시 1: \"상대방의 입장에서 생각해보려는 '공감 능력'이 도움이 되는 것 같아요. 그리고 '내가 틀릴 수도 있다'는 겸손한 마음가짐이 대화를 더 풍부하게 만드는 것 같아요.\"",
        "예시 2: \"먼저 경청하고, 상대방이 충분히 자신의 의견을 표현할 수 있도록 기다려주는 인내심이 중요한 것 같아요. 그래야 진짜 소통이 이루어지더라고요.\"",
        "예시 3: \"'다름'을 '틀림'으로 보지 않고, '새로운 시각'으로 받아들이려는 열린 마음이 가장 큰 도움이 되는 것 같아요. 덕분에 더 넓은 세상을 볼 수 있게 되었어요.\""
    ]
],
        },
        {
            id: 27,
            category: "관계탐구",
            type: "함께하는경험",
            title: "사람들과 함께 만들어낸 즐거운 경험",
            questions: [
                "다른 사람들과 함께 무언가를 계획하고 실행해서, 모두가 '정말 즐거웠다!'고 느꼈던 특별한 경험(예: 함께 준비한 이벤트, 여행 등)이 있다면 자세히 이야기해주세요.",
                "그 과정에서 사람들을 하나로 모이고 즐거운 분위기가 형성 될 수 있었던 데에 당신이 어떤 역할을 담당 하였나요? 그리고 그 역할을 수행함에 있어 당신의 어떤 내적인 매력이 도움이 되었나요?"
            ],
            examples: [
    [
        "예시 1: \"대학교 과 친구들과 함께 졸업여행을 기획했어요. 6개월 전부터 모두가 함께 계획을 세우고, 각자 역할을 나누어 준비했거든요. 여행 당일에는 모든 일정이 완벽하게 진행되어서 모두가 '정말 최고의 여행이었다'고 말했어요.\"",
        "예시 2: \"동아리에서 신입생 환영회를 준비할 때, 선배들과 함께 게임도 만들고 선물도 준비했어요. 신입생들이 정말 즐거워하는 모습을 보며 모든 준비 과정의 고생이 보람으로 바뀌었어요.\"",
        "예시 3: \"가족 생일파티를 서프라이즈로 준비한 적이 있어요. 형제들과 함께 몰래 계획을 세우고, 케이크도 직접 만들고 영상도 편집했어요. 당사자가 정말 감동해하는 모습을 보며 모두가 뿌듯해했어요.\""
    ],
    [
        "예시 1: \"저는 주로 '전체적인 조율 역할'을 담당했어요. 각자 다른 의견들을 조화롭게 맞추고, 모두가 만족할 수 있는 방향을 찾아내는 '소통 능력'과 '배려심'이 도움이 되었던 것 같아요.\"",
        "예시 2: \"분위기를 밝게 만드는 것과 세심한 준비를 담당했어요. 제가 가진 '긍정적인 에너지'와 '꼼꼼함'이 행사를 성공적으로 이끄는 데 큰 역할을 했던 것 같아요.\"",
        "예시 3: \"창의적인 아이디어를 내고 실행하는 역할이었어요. 평소 제가 가진 '기획력'과 '실행력', 그리고 '가족을 사랑하는 마음'이 모두 합쳐져서 특별한 순간을 만들 수 있었던 것 같아요.\""
    ]
],
        },
        {
            id: 28,
            category: "관계탐구",
            type: "관계회복",
            title: "관계 회복을 위한 용기",
            questions: [
                "혹시 친구나 가까운 사람과 오해가 생겨 마음이 상했지만, 먼저 다가가 관계를 다시 좋게 만들려고 노력했던 경험이 있나요? 있다면 어떤 상황이었나요?",
                "그때 당신의 어떤 마음이나 생각이 그런 용기 있는 행동을 가능하게 한 것 같나요?",
                "그런 선택을 할 수 있었던 데에 자신의 어떤 면이 도움이 되었던 것 같나요?"
            ],
            examples: [
    [
        "예시 1: \"고등학교 때 절친한 친구와 사소한 오해로 몇 주간 말을 안 한 적이 있어요. 서로 자존심 때문에 먼저 다가가지 못하고 있었는데, 결국 제가 먼저 연락해서 '우리 이야기 좀 하자'고 말했어요.\"",
        "예시 2: \"가족과 진로 문제로 크게 다툰 후 서로 마음이 상한 적이 있어요. 며칠 동안 집안 분위기가 어색했는데, 제가 먼저 부모님께 다가가서 진솔하게 제 마음을 전했어요.\"",
        "예시 3: \"동아리에서 의견 차이로 선배와 갈등이 생겼어요. 다른 사람들도 어색해하는 상황이었는데, 저는 그 선배를 따로 만나자고 해서 서로의 입장을 차근차근 이야기했어요.\""
    ],
    [
        "예시 1: \"'좋은 관계는 소중하다'는 생각이 가장 큰 힘이 되었어요. 자존심보다는 우정이 더 중요하다고 생각했거든요. 그리고 먼저 다가가는 것이 용기 있는 일이라고 생각했어요.\"",
        "예시 2: \"가족에 대한 사랑과 '화해가 늦어질수록 더 어려워진다'는 생각이 행동하게 만들었어요. 서로를 이해하고 싶다는 마음이 자존심을 누르고 용기를 주었어요.\"",
        "예시 3: \"팀의 화합이 개인의 감정보다 중요하다고 생각했어요. 그리고 문제를 방치하면 더 커질 것 같아서, 빨리 해결하고 싶다는 책임감이 용기를 주었어요.\""
    ],
    [
        "예시 1: \"갈등을 피하지 않고 정면으로 마주하는 '용기'와, 상대방의 입장도 이해하려는 '공감 능력'이 도움이 되었던 것 같아요. 그리고 관계를 소중히 여기는 마음이 가장 큰 힘이었어요.\"",
        "예시 2: \"먼저 사과할 수 있는 '겸손함'과 진솔하게 마음을 표현하는 '소통 능력'이 도움이 되었어요. 체면보다는 진정성을 택할 수 있는 용기도 중요했고요.\"",
        "예시 3: \"문제를 회피하지 않고 해결하려는 '적극성'과 상대방을 존중하는 '배려심'이 큰 도움이 되었어요. 그리고 더 큰 그림을 보는 '넓은 시각'도 중요했던 것 같아요.\""
    ]
],

        },
        {
            id: 29,
            category: "관계탐구",
            type: "위로와지지",
            title: "타인에게 위로와 힘을 주는 능력",
            questions: [
                "주변 사람이 힘든 시간을 보내고 있을 때, 당신의 따뜻한 말이나 행동으로 그에게 힘을 주었던 경험이 있다면 들려주세요.",
                "당신의 어떤 태도나 자세 덕분에 위로를 받은 사람이 기운을 차리고 용기를 얻은 것 같으신가요? 그리고 그때의 기분은 어땠나요?"
            ],
            examples: [
    [
        "예시 1: \"친한 친구가 취업 준비로 스트레스받고 있을 때, 그냥 옆에 앉아서 이야기를 들어주고 '힘들겠지만 너라면 분명 잘 될 거야'라고 말해줬어요. 가끔 맛있는 음식도 사주면서 응원했고요.\"",
        "예시 2: \"동생이 시험 결과가 안 좋아서 우울해할 때, 함께 산책을 하면서 '실패는 성공의 어머니라고, 이번 경험이 다음에는 더 잘할 수 있게 도와줄 거야'라고 격려해줬어요.\"",
        "예시 3: \"직장 동료가 실수로 상사에게 혼난 후 풀이 죽어있을 때, '누구나 실수할 수 있어. 중요한 건 다음에 더 잘하는 거지'라고 말하며 함께 해결방안을 찾아줬어요.\""
    ],
    [
        "예시 1: \"제가 먼저 판단하지 않고 끝까지 들어주는 '경청하는 자세'와 상대방의 감정에 진심으로 공감하는 '따뜻한 마음'이 도움이 된 것 같아요. 친구가 '너와 이야기하니까 마음이 편해진다'고 말해줬거든요.\"",
        "예시 2: \"실망한 상대방에게 희망을 잃지 않도록 도와주는 '긍정적인 시각'과 진심어린 격려를 전하는 '진정성'이 큰 역할을 했던 것 같아요. 동생이 다시 의욕을 찾는 모습을 보며 뿌듯했어요.\"",
        "예시 3: \"상대방을 비난하지 않고 함께 문제를 해결하려는 '협력적인 태도'와 구체적인 도움을 주려는 '실천력'이 도움이 되었어요. 그때 기분은 정말 보람찼어요. 누군가에게 힘이 될 수 있다는 게 감사했거든요.\""
    ]
]
        }
    ];
};

// ==================== AI 개인화 질문 선택 알고리즘 ====================
function selectPersonalizedQuestion() {
    const selectedCategories = testSystem.stage1_selections;
    const situationResponses = testSystem.stage2_situation_responses;
    const personalityResponses = testSystem.stage2_personality_responses;
    
    console.log('🤖 AI 개인화 질문 선택 시작:', {
        categories: selectedCategories,
        situation: situationResponses,
        personality: personalityResponses
    });
    
    // 각 영역별 점수 계산
    let valueScore = 0;    // 가치탐구 (8-14)
    let growthScore = 0;   // 성장탐구 (15-22)
    let relationScore = 0; // 관계탐구 (23-29)
    
    // 1단계 매력 카테고리별 점수 부여
    selectedCategories.forEach(category => {
        switch(category) {
            case "도덕성 및 양심":
            case "성실성 및 책임감":
                valueScore += 3;
                break;
            case "정서적 안정 및 자기 인식":
                valueScore += 2;
                growthScore += 1;
                break;
            case "지적 호기심 및 개방성":
            case "목표 지향성 및 야망":
                growthScore += 3;
                break;
            case "이해심 및 공감 능력":
            case "유머감각 및 사교성":
                relationScore += 3;
                break;
        }
    });
    
    // 2단계 응답 패턴 분석
    situationResponses.forEach(response => {
        const choice = response.selectedChoice.letter;
        switch(choice) {
            case 'A': relationScore += 1; break;
            case 'B': valueScore += 1; break;
            case 'C': growthScore += 1; break;
            case 'D': valueScore += 1; break;
        }
    });
    
    personalityResponses.forEach(response => {
        const choice = response.selectedChoice.letter;
        switch(choice) {
            case 'A': 
                if (response.questionText.includes('에너지')) relationScore += 1;
                else if (response.questionText.includes('관계')) relationScore += 1;
                else growthScore += 1;
                break;
            case 'B':
                if (response.questionText.includes('에너지')) valueScore += 1;
                else valueScore += 1;
                break;
        }
    });
    
    console.log('🎯 점수 계산 결과:', {
        valueScore,
        growthScore,
        relationScore
    });
    
    // 최고 점수 영역 결정
    let selectedCategory;
    let questionIds;
    
    if (growthScore >= valueScore && growthScore >= relationScore) {
        selectedCategory = "성장탐구";
        questionIds = [15, 16, 17, 18, 19, 20, 21, 22];
    } else if (relationScore >= valueScore) {
        selectedCategory = "관계탐구";
        questionIds = [23, 24, 25, 26, 27, 28, 29];
    } else {
        selectedCategory = "가치탐구";
        questionIds = [8, 9, 10, 11, 12, 13, 14];
    }
    
    // 해당 영역에서 랜덤 선택
    const randomIndex = Math.floor(Math.random() * questionIds.length);
    const selectedQuestionId = questionIds[randomIndex];
    
    console.log('✅ 선택된 영역:', selectedCategory);
    console.log('✅ 선택된 질문 ID:', selectedQuestionId);
    
    return selectedQuestionId;
}

// 경험 탐구 질문 선택 (항상 1-7 중 하나)
function selectExperienceQuestion() {
    const experienceQuestionIds = [1, 2, 3, 4, 5, 6, 7];
    const randomIndex = Math.floor(Math.random() * experienceQuestionIds.length);
    return experienceQuestionIds[randomIndex];
}

// ==================== 성찰 질문 렌더링 ====================
function renderStage3Page(pageNumber) {
    let questionId;
    let containerId;
    
    if (pageNumber === 1) {
        // 1페이지: 경험 탐구 질문
        questionId = selectExperienceQuestion();
        containerId = 'reflectionContainer1';
    } else {
        // 2페이지: AI 개인화 질문
        questionId = selectPersonalizedQuestion();
        containerId = 'reflectionContainer2';
    }
    
    renderReflectionQuestion(questionId, containerId, pageNumber);
}

function renderReflectionQuestion(questionId, containerId, pageNumber) {
    const container = document.getElementById(containerId);
    const allQuestions = testSystem.getReflectionQuestions();
    const question = allQuestions.find(q => q.id === questionId);
    
    if (!question) {
        console.error('❌ 질문을 찾을 수 없습니다:', questionId);
        return;
    }
    
    console.log('📝 질문 렌더링:', question.title);
    
    container.innerHTML = `
        <div class="reflection-question-card">
            <div class="reflection-question-header">
                <div class="reflection-question-title">${question.title}</div>
                <div class="reflection-question-number">${pageNumber}/2</div>
            </div>
            
            <div class="attraction-guide">
                <div class="attraction-guide-icon">✨</div>
                <div class="attraction-guide-text">
                    <strong>매력 키워드를 활용하세요!</strong><br>
                    답변 작성 시 매력 키워드를 선택하면 더 풍부한 표현을 할 수 있습니다.
                </div>
            </div>
            
            <div class="reflection-sub-questions">
                ${question.questions.map((subQuestion, index) => `
                    <div class="reflection-sub-question">
                        <div class="reflection-sub-question-title">
                            ${pageNumber}-${index + 1}. ${subQuestion}
                        </div>
                        
                        <div class="helper-buttons">
                            <button class="helper-btn skip" onclick="skipQuestion(${questionId}, ${index})">⏭️ 패스하기</button>
                            <button class="helper-btn" onclick="showExample(${questionId}, ${index})">💡 예시 보기</button>
                            <button class="helper-btn" onclick="showTemplate(${questionId}, ${index})">📝 템플릿</button>
                            <button class="helper-btn attraction-keyword-btn" onclick="showAttractionKeywords(${questionId}, ${index})">
                                ✨ <strong>매력 키워드 참고</strong> ✨
                            </button>
                        </div>
                        
                        <div class="textarea-container">
                            <div class="selected-keywords" id="selectedKeywords_${questionId}_${index}">
                                <div class="keywords-label">선택한 매력 키워드:</div>
                                <div class="keywords-tags">
                                    <div class="no-keywords">아직 선택된 키워드가 없습니다</div>
                                </div>
                            </div>
                            
                            <textarea 
                                class="reflection-textarea" 
                                placeholder="자유롭게 생각을 적어주세요..."
                                id="reflection_${questionId}_${index}"
                                onfocus="window.currentTextarea = this; window.currentQuestionId = ${questionId}; window.currentSubIndex = ${index};"
                                oninput="saveReflectionAnswer(${questionId}, ${index}, this.value)"
                            ></textarea>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 이전 답변 복원
    restoreReflectionAnswers(questionId);
}

// ==================== 답변 저장 및 복원 ====================
function saveReflectionAnswer(questionId, subIndex, value) {
    if (!testSystem.stage3_responses) {
        testSystem.stage3_responses = {};
    }
    
    if (!testSystem.stage3_responses[questionId]) {
        testSystem.stage3_responses[questionId] = {};
    }
    
    testSystem.stage3_responses[questionId][subIndex] = value;
    console.log('💾 답변 저장:', questionId, subIndex, value.substring(0, 30) + '...');
}

function restoreReflectionAnswers(questionId) {
    if (testSystem.stage3_responses && testSystem.stage3_responses[questionId]) {
        Object.keys(testSystem.stage3_responses[questionId]).forEach(subIndex => {
            const textarea = document.getElementById(`reflection_${questionId}_${subIndex}`);
            if (textarea) {
                textarea.value = testSystem.stage3_responses[questionId][subIndex];
            }
        });
    }
}

// ==================== 도우미 기능들 ====================
function skipQuestion(questionId, subIndex) {
    const textarea = document.getElementById(`reflection_${questionId}_${subIndex}`);
    if (textarea) {
        textarea.value = "[패스함]";
        textarea.style.background = "#f7fafc";
        saveReflectionAnswer(questionId, subIndex, "[패스함]");
    }
}





// ==================== 키워드 태그 관리 ====================
function addKeywordTag(keyword) {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    
    if (!questionId || subIndex === undefined) return;
    
    const keywordsContainer = document.getElementById(`selectedKeywords_${questionId}_${subIndex}`);
    const tagsContainer = keywordsContainer.querySelector('.keywords-tags');
    
    // 이미 선택된 키워드인지 확인
    const existingTags = tagsContainer.querySelectorAll('.keyword-tag');
    const existingKeywords = Array.from(existingTags).map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingKeywords.includes(keyword)) {
        alert('이미 선택된 키워드입니다!');
        return;
    }
    
    // "키워드 없음" 메시지 제거
    const noKeywordsMsg = tagsContainer.querySelector('.no-keywords');
    if (noKeywordsMsg) {
        noKeywordsMsg.remove();
    }
    
    // 새로운 키워드 태그 생성
    const keywordTag = document.createElement('div');
    keywordTag.className = 'keyword-tag';
    keywordTag.innerHTML = `
        ${keyword}
        <button class="remove-btn" onclick="removeKeywordTag(this)" title="키워드 제거">×</button>
    `;
    
    tagsContainer.appendChild(keywordTag);
    console.log(`✨ 키워드 "${keyword}" 추가됨`);
    
    // 모달 닫기
    closeModal('attractionModal');
}

function removeKeywordTag(button) {
    const tag = button.parentElement;
    const keyword = tag.textContent.replace('×', '').trim();
    
    tag.remove();
    
    // 키워드가 모두 제거되면 "키워드 없음" 메시지 표시
    const tagsContainer = tag.parentElement;
    if (tagsContainer && tagsContainer.children.length === 0) {
        const noKeywordsMsg = document.createElement('div');
        noKeywordsMsg.className = 'no-keywords';
        noKeywordsMsg.textContent = '아직 선택된 키워드가 없습니다';
        tagsContainer.appendChild(noKeywordsMsg);
    }
    
    console.log(`🗑️ 키워드 "${keyword}" 제거됨`);
}

// ==================== 설문조사 렌더링 ====================

function checkSurveyCompletion() {
    const requiredFields = ['overall_satisfaction', 'recommendation'];
    let allCompleted = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]:checked`);
        if (!field) {
            allCompleted = false;
        }
    });
    
    document.getElementById('surveySubmitBtn').disabled = !allCompleted;
}

// ==================== 설문조사 제출 및 완료 ====================
function submitSurvey() {
    console.log('📊 설문조사 제출 시작');
    
    // 필수 항목 체크
    const satisfaction = document.querySelector('input[name="overall_satisfaction"]:checked');
    const recommendation = document.querySelector('input[name="recommendation"]:checked');
    
    if (!satisfaction || !recommendation) {
        alert('필수 항목을 모두 선택해주세요.');
        return;
    }
    
    // 🔥 설문 데이터 수집
    const surveyData = {
        overall_satisfaction: document.querySelector('input[name="overall_satisfaction"]:checked')?.value || '',
        discovery_help: document.querySelector('input[name="discovery_help"]:checked')?.value || '',
        recommendation: document.querySelector('input[name="recommendation"]:checked')?.value || '',
        stage1_rating: document.querySelector('input[name="stage1_rating"]:checked')?.value || '',
        stage2_rating: document.querySelector('input[name="stage2_rating"]:checked')?.value || '',
        stage3_rating: document.querySelector('input[name="stage3_rating"]:checked')?.value || '',
        onboarding_rating: document.querySelector('input[name="onboarding_rating"]:checked')?.value || '',
        skip_option_rating: document.querySelector('input[name="skip_option_rating"]:checked')?.value || '',
        example_rating: document.querySelector('input[name="example_rating"]:checked')?.value || '',
        template_rating: document.querySelector('input[name="template_rating"]:checked')?.value || '',
        keywords_rating: document.querySelector('input[name="keywords_rating"]:checked')?.value || '',
        understanding_improvement: document.querySelector('input[name="understanding_improvement"]:checked')?.value || '',
        positivity_improvement: document.querySelector('input[name="positivity_improvement"]:checked')?.value || '',
        
        positive_experience: document.querySelector('textarea[name="positive_experience"]')?.value || '',
        understanding_reason: document.querySelector('textarea[name="understanding_reason"]')?.value || '',
        development_suggestion: document.querySelector('textarea[name="development_suggestion"]')?.value || '',
        needs_improvement: document.querySelector('textarea[name="needs_improvement"]')?.value || '',
        improvement_reason: document.querySelector('textarea[name="improvement_reason"]')?.value || '',
        submitted_at: new Date().toISOString()
    };
    
    // 🔥 여기에 추가하세요!
    completeTestData.survey_responses = surveyData;
    
    // 전체 테스트 데이터 구성
    const finalTestData = {
        userId: localStorage.getItem('userId') || generateUserId(),
        stage1_selections: testSystem.stage1_selections,
        stage2_situation_responses: testSystem.stage2_situation_responses,
        stage2_personality_responses: testSystem.stage2_personality_responses,
        stage3_responses: testSystem.stage3_responses,
        survey_responses: surveyData,
        completed: true,
        timestamp: new Date().toISOString(),
        stage1_duration: window.completeTestData?.stage1_duration,
        stage2_duration: window.completeTestData?.stage2_duration,
        stage3_duration: window.completeTestData?.stage3_duration
    };
    
    console.log('📋 완전한 테스트 데이터:', finalTestData);  // 🔥 변수명도 수정
    
    // Firebase에 저장
    if (window.firebaseDB) {
        window.firebaseAddDoc(window.firebaseCollection(window.firebaseDB, 'complete_responses'), finalTestData)
            .then(() => {
                console.log('🔥 Firebase 저장 완료!');
                showFinalComplete();
            })
            .catch((error) => {
                console.error('❌ Firebase 저장 실패:', error);
                localStorage.setItem('completeTestData', JSON.stringify(finalTestData));  // 🔥 변수명도 수정
                showFinalComplete();
            });
    } else {
        console.log('💾 로컬 저장으로 진행');
        localStorage.setItem('completeTestData', JSON.stringify(finalTestData));  // 🔥 변수명도 수정
        showFinalComplete();
    }
}
function showFinalComplete() {
    document.getElementById('surveyStage').style.display = 'none';
    document.getElementById('finalComplete').style.display = 'block';
    
    document.getElementById('completeContent').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎊</div>
            <h3 style="color: #5a67d8; margin-bottom: 20px;">소중한 참여 감사합니다!</h3>
            <p style="color: #718096; line-height: 1.6;">
                ASTER 프로그램을 통해 자신의 매력을 탐색하는 시간이 되셨기를 바랍니다.<br>
                여러분의 피드백은 프로그램 개선에 큰 도움이 됩니다.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="color: #4a5568; margin-bottom: 15px;">🎯 당신이 선택한 매력 카테고리</h4>
                <p style="font-size: 16px; font-weight: bold; color: #5a67d8;">
                    ${testSystem.stage1_selections.join(' • ')}
                </p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                <p style="font-size: 14px; color: #4c51bf;">
                    💡 <strong>다음 단계 제안:</strong><br>
                    오늘 작성한 성찰 내용을 바탕으로 지속적인 자기계발에 도전해보세요!<br>
                    자신만의 매력을 더욱 발전시켜 나가시길 응원합니다.
                </p>
            </div>
            
            <div style="margin-top: 30px;">
                <button class="btn" onclick="location.reload()">새로운 테스트 시작하기</button>
            </div>
            
                        <div style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                완료 시간: ${new Date().toLocaleString('ko-KR')}
            </div>
        </div>
    `;
}

// ==================== 유틸리티 함수들 ====================

// 사용자 ID 생성
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 결과 다운로드 함수
function downloadResults() {
    const completeData = {
        testInfo: {
            programName: "ASTER 매력 탐구 프로그램",
            completedAt: new Date().toLocaleString('ko-KR'),
            userId: localStorage.getItem('userId') || 'anonymous'
        },
        selectedCategories: testSystem.stage1_selections,
        situationResponses: testSystem.stage2_situation_responses,
        personalityResponses: testSystem.stage2_personality_responses,
        reflectionResponses: testSystem.stage3_responses
    };
    
    const dataStr = JSON.stringify(completeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ASTER_결과_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// ===== 뒤로가기 함수들 =====
function backToStage3Page4() {
    console.log('3단계로 돌아가기');
    document.getElementById('surveyStage').style.display = 'none';
    document.getElementById('stage3_page2').style.display = 'block';
}

// 기존 코드 마지막 부분에 이 함수를 추가하세요:

function showExample(questionId, subIndex) {
    // 현재 질문 정보 저장
    window.currentQuestionId = questionId;
    window.currentSubIndex = subIndex;
    
    console.log('예시 모달 열기:', questionId, subIndex);
    
    // 해당 질문의 예시 데이터 찾기
    const allQuestions = testSystem.getReflectionQuestions();
    const question = allQuestions.find(q => q.id === questionId);
    
    if (!question || !question.examples || !question.examples[subIndex]) {
        console.error('예시 데이터를 찾을 수 없습니다:', questionId, subIndex);
        alert('예시 데이터를 불러올 수 없습니다.');
        return;
    }
    
    const examples = question.examples[subIndex];
    const content = document.getElementById('exampleContent');
    
    // 예시 내용 생성
    let html = `
        <div class="example-header">
            <h4 style="color: #5a67d8; margin-bottom: 15px;">💡 답변 예시</h4>
            <p style="font-size: 14px; color: #718096; margin-bottom: 20px;">
                다음 예시들을 참고해서 자신만의 답변을 작성해보세요.
            </p>
        </div>
        
        <div class="examples-list">
    `;
    
    examples.forEach((example, index) => {
        html += `
            <div class="example-item">
                <div class="example-number">예시 ${index + 1}</div>
                <div class="example-text">${example}</div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; font-size: 13px; color: #4c51bf;">
            💡 <strong>팁:</strong> 예시를 그대로 복사하지 마시고, 자신만의 경험과 이야기로 답변해보세요!
        </div>
    `;
    
    content.innerHTML = html;
    document.getElementById('exampleModal').style.display = 'block';
}

// 모달 닫기 함수 (혹시 없다면 추가)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 모달 외부 클릭시 닫기 (기존 함수 업데이트)
window.onclick = function(event) {
    const modals = ['exampleModal', 'templateModal', 'attractionModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
// ==================== 템플릿 데이터 ====================
const TEMPLATE_DATA = {
    // 경험 질문 1 (실패와 배움)
    1: [
        [
            "어떤 상황에서 기대와 다른 결과를 경험했나요? (예: 프로젝트, 시험, 인간관계 등)",
            "그때 당신의 구체적인 기대는 무엇이었고, 실제 결과는 어떠했나요?",
            "'실패'라고 느꼈다면, 어떤 점 때문에 그렇게 생각했나요?"
        ],
        [
            "좌절감을 느꼈을 때, 상황을 받아들이거나 다시 시작하기 위해 어떤 노력을 했나요?",
            "그 과정에서 도움이 되었던 당신의 성격, 태도, 능력은 무엇이었나요? (한두 가지 핵심적인 것을 떠올려보세요.)",
            "주변 사람들의 도움이나 격려가 있었다면 그것도 함께 적어주세요."
        ],
        [
            "그 경험을 통해 얻은 가장 큰 깨달음이나 교훈은 무엇인가요?",
            "그 교훈은 현재 당신의 삶이나 생각에 어떤 영향을 주고 있나요?",
            "그 경험 이후, 비슷한 상황에 놓인다면 어떻게 다르게 행동할 것 같나요?"
        ]
    ],
    
    // 경험 질문 2 (성취와 자부심)
    2: [
        [
            "언제, 어떤 일을 성취했을 때 가장 큰 자부심을 느꼈나요?",
            "그 성취가 당신에게 왜 특별한 의미가 있었나요?",
            "당시 어떤 결과나 인정을 받으셨나요?"
        ],
        [
            "그 목표를 설정하게 된 계기나 당신의 마음속 동기는 무엇이었나요?",
            "목표를 이루기까지 과정에서 겪었던 가장 큰 어려움이나 예상치 못한 문제는 무엇이었나요?",
            "그 어려움 앞에서 어떤 심정이 들었나요?"
        ],
        [
            "어려움을 극복하는 과정에서 가장 중요하게 작용했던 당신의 성격, 태도, 또는 능력은 무엇이었나요? (1~2가지)",
            "그것이 어떻게 어려움을 이겨내는 데 도움을 주었는지 구체적으로 설명해주세요.",
            "그때 '나에게 이런 면이 있었네' 하고 새삼 느꼈던 당신의 모습이 있나요?"
        ],
        [
            "그 성취 경험이 당신에게 남긴 가장 큰 교훈이나 의미는 무엇인가요?",
            "그 경험 이후 당신의 삶이나 생각에 어떤 긍정적인 변화가 있었나요?",
            "그때의 성공 경험을 떠올리면 지금 어떤 기분이 드나요?"
        ]
    ],
    
    // 경험 질문 3 (예상치 못한 어려움 대처)
    3: [
        [
            "언제, 어떤 예상치 못한 어려움이나 당황스러운 상황을 겪었나요?",
            "그 상황에서 가장 먼저 들었던 감정(예: 당황, 불안, 막막함 등)은 무엇이었나요?",
            "'아, 이건 정말 예상 못 했다' 싶었던 포인트는 무엇이었나요?"
        ],
        [
            "그 상황을 해결하거나 마음을 다잡기 위해 어떤 생각이나 행동을 했나요?",
            "그때 발휘되었던 당신의 성격, 능력, 또는 지혜는 무엇이라고 생각하나요?",
            "어떤 점 때문에 그 능력이 효과적으로 작용했다고 보시나요?"
        ],
        [
            "그 경험 이전에는 미처 몰랐지만, 그 일을 통해 새롭게 발견한 당신의 모습이나 강점은 무엇인가요?",
            "그 발견이 당신에게 어떤 느낌을 주었나요? (예: 놀라움, 뿌듯함, 자신감 등)",
            "앞으로 그 강점을 어떻게 활용하고 싶으신가요?"
        ]
    ],
    
    // 경험 질문 4 (일상 속 숨겨진 매력)
    4: [
        [
            "다른 사람들이 당신의 어떤 행동이나 습관에 대해 칭찬하거나 고마움을 표현하나요? (구체적인 행동을 적어보세요.)",
            "당신은 그 행동을 스스로 '특별하다'고 생각하지 않았던 이유가 무엇인가요?",
            "주변 사람들의 그런 반응을 들었을 때 어떤 기분이 들었나요?"
        ],
        [
            "그 행동에 대한 타인의 긍정적인 피드백을 통해, 스스로의 능력을 새롭게 인식하게 된 순간은 언제였나요?",
            "그 행동을 하면서 당신 스스로 즐거움이나 만족감을 느꼈던 구체적인 경험을 이야기해주세요.",
            "그때 어떤 감정(예: 뿌듯함, 기쁨, 자신감)을 느꼈나요?"
        ],
        [
            "당신이 발견한 그 일상 속 매력을 앞으로 어떤 상황에서 더 적극적으로 활용해보고 싶나요?",
            "그 매력을 더욱 발전시키기 위해 어떤 노력을 해볼 수 있을까요? (예: 관련 학습, 새로운 시도 등)",
            "그 매력을 통해 당신의 삶이나 주변에 어떤 긍정적인 변화를 만들고 싶으신가요?"
        ]
    ],
    
    // 경험 질문 5 (자발적인 개선 노력)
    5: [
        [
            "어떤 상황에서 '내가 한번 해봐야겠다'는 생각이 들었나요? (구체적인 상황 설명)",
            "누가 시키지 않았는데도 당신이 자발적으로 했던 행동은 무엇이었나요?",
            "그 행동의 결과는 어떠했나요?"
        ],
        [
            "그렇게 행동하게 된 당신의 주된 동기나 마음은 무엇이었나요? (예: 도움을 주고 싶은 마음, 더 나은 환경을 만들고 싶은 마음 등)",
            "그 행동을 통해 이루고 싶었던 작은 목표가 있었다면 무엇이었나요?",
            "다른 사람이 알아주지 않아도 괜찮다고 생각했나요? 그 이유는 무엇인가요?"
        ],
        [
            "그 자발적인 행동을 통해 드러난 당신의 좋은 성향이나 능력은 무엇이라고 생각하시나요? (세부 매력 키워드를 참고해도 좋아요!)",
            "그 경험을 통해 당신이 평소 중요하게 생각하는 가치(예: 효율, 나눔, 공동체 등)를 다시 한번 확인하게 되었나요?",
            "스스로 그런 성향이나 가치를 가지고 있다는 점에 대해 어떻게 생각하시나요?"
        ]
    ],
    
    // 경험 질문 6 (꾸준한 노력과 성취)
    6: [
        [
            "어떤 목표를 세우셨나요?",
            "그 목표를 이루기까지 어느 정도의 시간이 걸렸고, 구체적으로 어떤 노력을 하셨나요?",
            "마침내 이루어낸 성과는 무엇이었나요?"
        ],
        [
            "목표를 향해 나아가는 과정에서 가장 힘들었거나 포기하고 싶었던 순간은 언제였나요?",
            "그럼에도 불구하고 계속 나아갈 수 있도록 당신을 지탱해 준 당신의 가장 큰 강점이나 능력은 무엇이었나요?",
            "그 강점이 어떻게 발휘되었는지 구체적인 상황을 떠올려 적어보세요."
        ],
        [
            "그 성취를 통해 당신은 무엇을 얻거나 배우게 되었나요?",
            "당신의 자신감, 가치관, 또는 일상에 어떤 긍정적인 변화가 생겼나요?",
            "그 경험이 앞으로 당신의 삶에 어떤 영향을 줄 것이라고 기대하시나요?"
        ]
    ],
    
    // 경험 질문 7 (작은 용기 있는 시도)
    7: [
        [
            "평소 당신이라면 망설였을 것 같은데, 최근 용기를 내어 시도해 본 작은 일은 무엇이었나요?",
            "그 시도를 하기 전에 어떤 점 때문에 주저했었나요?",
            "결과적으로 어떤 새로운 경험을 하게 되었나요?"
        ],
        [
            "그 작은 시도를 하는 데 도움이 되었던 당신의 생각, 감정, 또는 성격적인 면은 무엇이었나요?",
            "혹시 누군가의 격려나 지지가 있었다면 그것도 적어주세요.",
            "어떤 마음으로 그 작은 용기를 내게 되었나요?"
        ],
        [
            "그 작은 용기 있는 시도를 통해 당신 자신에 대해 새롭게 알게 된 점은 무엇인가요?",
            "혹시 '나에게 이런 강점이나 매력이 있었네?' 하고 발견한 것이 있다면 적어주세요.",
            "그 경험 이후, 비슷한 상황에서 또다시 용기를 내볼 마음이 생겼나요?"
        ]
    ],
    
    // 가치 질문 1 (소중한 기준/생각)
    8: [
        [
            "당신의 삶에서 '이것만은 꼭!' 하고 지키고 싶은 당신만의 기준이나 생각이 있다면 무엇인가요? (단어나 짧은 문장으로 표현해 보세요.)",
            "그 기준/생각이 왜 당신에게 그토록 소중한가요?",
            "일상생활에서 그 기준/생각을 어떻게 실천하려고 노력하시나요?"
        ],
        [
            "그 기준이나 생각을 갖게 된 결정적인 사건이나 경험이 있었나요? (언제, 어떤 일이었나요?)",
            "혹시 당신의 가치관에 영향을 준 책, 영화, 또는 인물이 있나요? (누구/무엇이며, 어떤 점에서 영향을 받았나요?)",
            "그 계기나 인물을 통해 무엇을 깨닫게 되었나요?"
        ],
        [
            "그 기준이나 생각이 당신의 선택이나 행동에 어떤 긍정적인 변화를 가져왔나요?",
            "그로 인해 당신의 인간관계, 일, 또는 자기 자신에 대한 생각에 어떤 좋은 점들이 생겼나요?",
            "만약 그 기준이 없었다면 지금의 당신은 어땠을 것 같나요?"
        ]
    ],
    
    // 가치 질문 2 (선택의 갈등)
    9: [
        [
            "어떤 상황에서 두 가지 중요한 가치나 선택지가 충돌했나요?",
            "그 두 가지는 각각 무엇이었고, 왜 둘 다 당신에게 중요했나요?",
            "그때 어떤 감정이나 고민을 느꼈나요?"
        ],
        [
            "선택을 내리기까지 어떤 점들을 주로 고민했나요? (각 선택지의 장단점, 결과에 대한 예상 등)",
            "결국 어떤 선택을 했고, 그 선택을 한 가장 큰 이유는 무엇이었나요?",
            "결정을 내린 후 어떤 마음이 들었나요?"
        ],
        [
            "당신의 여러 가치들(예: 성실, 배려, 성장, 정의 등) 중에서 그 결정에 가장 큰 영향을 준 것은 무엇이었나요?",
            "왜 그 가치가 그 순간 당신에게 가장 중요하다고 느껴졌나요?",
            "그 결정은 당신의 그 가치를 잘 반영한 선택이었다고 생각하시나요?"
        ]
    ],
    
    // 가치 질문 3 (타인을 대하는 마음가짐)
    10: [
        [
            "다른 사람과의 관계에서 당신이 가장 중요하게 생각하는 원칙이나 태도는 무엇인가요? (1~2가지)",
            "왜 그것이 중요하다고 생각하시나요?",
            "일상에서 그 태도를 어떻게 실천하고 있나요?"
        ],
        [
            "그 생각이나 태도를 갖게 된 구체적인 경험이나 사건이 있나요?",
            "혹은 누군가의 말이나 행동을 보고 배우게 된 것인가요?",
            "그 계기를 통해 당신은 무엇을 느끼거나 배우게 되었나요?"
        ],
        [
            "그런 마음가짐을 지키는 당신에게서 어떤 좋은 점이나 강점이 보이나요? (세부 매력 키워드를 참고해도 좋아요!)",
            "그 매력이 다른 사람들과의 관계에 어떤 긍정적인 영향을 준다고 생각하시나요?",
            "스스로 그런 매력을 가지고 있다는 사실에 대해 어떻게 느끼시나요?"
        ]
    ],
    
    // 가치 질문 4 (어려움 속 소중한 다짐)
    11: [
        [
            "당신의 삶에서 큰 변화나 예상치 못한 어려움을 겪었던 시기를 떠올려보세요. (어떤 시기였나요?)",
            "그 혼란스럽고 어려운 상황 속에서도 '이것만큼은 꼭 지켜야 해' 또는 '이것만은 잃지 말아야 해'라고 생각했던 당신만의 소중한 생각, 가치, 또는 다짐은 무엇이었나요?",
            "왜 그것을 그토록 중요하게 여기고 놓치지 않으려고 했나요?"
        ],
        [
            "그 소중한 생각이나 다짐을 지켜나가는 과정에서 어떤 어려움이나 유혹이 있었나요?",
            "그럼에도 불구하고 그것을 꿋꿋이 지켜낼 수 있었던 당신의 가장 큰 내면의 힘(성격, 가치관, 능력 등)은 무엇이었다고 생각하시나요?",
            "그 내면의 힘이 어떻게 발휘되었는지 구체적으로 설명해주세요."
        ]
    ],
    
    // 가치 질문 5 (열정의 원천)
    12: [
        [
            "당신이 시간 가는 줄 모르고 몰입하며 열정을 느끼는 분야나 활동은 무엇인가요? (구체적으로 어떤 활동인가요?)",
            "언제부터 그 분야나 활동에 관심을 갖게 되었나요?",
            "그 활동을 할 때 당신은 주로 어떤 모습인가요? (예: 집중하는 모습, 즐거워하는 모습 등)"
        ],
        [
            "그 분야나 활동에 그토록 열정을 쏟게 만드는 당신만의 특별한 이유나 동기가 있나요?",
            "그 활동을 통해 당신이 추구하거나 실현하고자 하는 중요한 가치(예: 성장, 재미, 기여, 성취 등)는 무엇인가요?",
            "만약 그 활동을 할 수 없다면 어떤 기분일 것 같나요?"
        ],
        [
            "그 열정적인 활동을 하면서 '나에게 이런 면이 있었네?' 하고 새롭게 발견하거나 다시 한번 확인하게 된 당신의 강점이나 매력은 무엇인가요?",
            "그 강점이나 매력이 그 활동을 더 잘하거나 즐기는 데 어떤 도움을 주나요?",
            "다른 사람들도 당신의 그런 모습을 알아봐 주나요? (그렇다면 어떤 반응인가요?)"
        ]
    ],
    
    // 가치 질문 6 (바라는 삶의 모습과 내적 강점)
    13: [
        [
            "앞으로 당신의 삶에서 어떤 생각이나 마음가짐을 더 중요하게 여기고 싶나요? (키워드나 짧은 문장으로 표현해보세요.)",
            "혹은 어떤 구체적인 모습으로 살아가고 싶다고 바라나요? (이상적인 당신의 모습을 그려보세요.)",
            "왜 그런 모습이나 마음가짐을 더 중요하게 여기고 싶다고 생각하게 되었나요?"
        ],
        [
            "당신이 바라는 그 모습이나 마음가짐을 실현하는 데 도움이 될 만한, 당신 안에 이미 있는 잠재력이나 강점은 무엇이라고 생각하시나요?",
            "그 잠재력이나 강점을 어떻게 더 믿고 키워나갈 수 있을까요? (구체적인 방법이나 생각을 적어보세요.)",
            "그것을 발전시키는 과정에서 어떤 어려움이 예상되고, 어떻게 극복할 수 있을까요?"
        ]
    ],
    
    // 가치 질문 7 (결과의 수용과 성장)
    14: [
        [
            "결과가 기대에 미치지 못했지만, 다른 사람이나 외부 상황을 탓하지 않고 그 결과를 있는 그대로 마주했던 경험을 떠올려보세요. (어떤 상황이었나요?)",
            "그때 어떤 마음가짐으로 그 상황과 결과를 받아들이려고 노력했나요? (예: '어쩔 수 없는 일이야', '내게도 책임이 있지', '이 또한 경험이다' 등)",
            "왜 다른 누구의 탓으로 돌리기보다 담담하게 받아들이는 쪽을 선택했나요? 그 이유는 무엇이었나요?"
        ],
        [
            "그렇게 상황과 결과를 받아들이는 경험이 당신에게 어떤 긍정적인 변화나 깨달음을 가져다주었나요?",
            "그 경험이 당신의 성장을 위한 동기나 발판이 되었나요? (그렇다면 구체적으로 어떤 면에서 성장했다고 느끼시나요?)",
            "혹시 그 과정을 통해 이전에는 미처 몰랐던 당신의 새로운 모습이나 강점(예: 책임감, 문제 해결에 대한 의지, 긍정적인 태도 등)을 발견하게 되었나요?"
        ]
    ],
    
    // 성장 질문 1 (바라는 성장 모습)
    15: [
        [
            "1년 뒤, 또는 더 먼 미래에 어떤 면에서 '성장했다'고 느끼고 싶으신가요? (구체적인 능력, 태도, 성과 등)",
            "당신이 가장 바라는 '성장한 모습'은 어떤 특징을 가지고 있나요?",
            "왜 그런 모습으로 성장하고 싶다고 생각하시나요?"
        ],
        [
            "당신이 바라는 그 성장한 모습을 이루는 데 도움이 될 만한, 당신이 이미 가지고 있는 강점이나 좋은 점은 무엇인가요?",
            "그 강점이나 잠재력을 어떻게 더 키우거나 활용할 수 있을까요?",
            "어떤 노력을 통해 그 멋진 모습에 더 가까워질 수 있다고 생각하시나요?"
        ]
    ],
    
    // 성장 질문 2 (새로운 배움의 기회)
    16: [
        [
            "만약 시간과 기회가 충분하다면, 가장 먼저 도전해보고 싶은 새로운 배움이나 경험은 무엇인가요? (분야나 구체적인 활동)",
            "왜 그것을 배우거나 경험해보고 싶다고 생각했나요?",
            "그것을 통해 무엇을 얻거나 느끼고 싶으신가요?"
        ],
        [
            "그 배움이나 경험이 당신의 어떤 기존 강점을 더욱 발전시키는 데 도움이 될 것 같나요?",
            "혹은, 당신의 어떤 새로운 가능성이나 잠재력을 열어줄 수 있다고 생각하시나요?",
            "그것을 통해 궁극적으로 당신이 얻고 싶은 것은 무엇인가요?"
        ],
        [
            "그 새로운 배움이나 경험을 통해 당신의 어떤 내적인 면(성격, 능력, 태도 등)이 더 강해지거나 채워질 수 있을까요?",
            "그것이 당신을 어떤 면에서 더 성장한 사람으로 만들어줄 수 있을까요?",
            "그렇게 채워진 강점으로 무엇을 하고 싶으신가요?"
        ]
    ],
    
    // 성장 질문 3 (스스로 바라는 변화)
    17: [
        [
            "현재 당신의 모습 중에서 '이런 점은 좀 바꾸고 싶다' 또는 '더 발전시키고 싶다'고 생각하는 부분이 있나요? (구체적으로 어떤 모습인가요?)",
            "왜 그 부분을 변화시키고 싶다고 생각하게 되었나요?",
            "그 변화를 통해 어떤 모습이 되기를 기대하시나요?"
        ],
        [
            "당신이 바라는 그 긍정적인 변화가 현실이 된다면, 당신의 일상생활에 어떤 구체적인 변화가 생길까요?",
            "당신의 마음 상태나 감정은 어떻게 달라질 것 같나요?",
            "그 변화로 인해 어떤 새로운 기회나 가능성이 열릴 수 있을까요?"
        ],
        [
            "당신이 바라는 변화를 추구하는 과정에서, 혹시 지금 당신이 가진 좋은 점이나 강점 중 일부가 약해지거나 사라질 수도 있다고 생각되는 부분이 있나요?",
            "그렇다면 구체적으로 어떤 장점을 잃을 수도 있을까요?",
            "그럼에도 불구하고 그 변화를 추구하고 싶으신가요? 혹은 어떻게 균형을 맞출 수 있을까요?"
        ]
    ],
    
    // 성장 질문 4 (선한 영향력)
    18: [
        [
            "주변 사람, 특정 그룹, 혹은 세상 전체에 어떤 '좋은 영향'을 주고 싶다고 생각해 본 적이 있나요? (구체적으로 어떤 종류의 영향인가요?)",
            "왜 그런 영향을 주고 싶다는 생각을 하게 되었나요? (계기가 있다면 함께 적어주세요.)",
            "그 영향이 실현된다면 어떤 긍정적인 변화가 생길 거라고 기대하시나요?"
        ],
        [
            "그런 좋은 영향을 주는 데 도움이 될 만한, 당신이 이미 가지고 있는 강점이나 좋은 면은 무엇인가요? (1~2가지)",
            "앞으로 그 영향을 더 잘 주기 위해, 어떤 능력이나 자질을 더욱 키우고 싶으신가요?",
            "그 능력들이 어떻게 좋은 영향을 주는 데 기여할 수 있을까요?"
        ],
        [
            "당신의 그 매력(강점/능력)을 활용하여 좋은 영향을 줄 수 있는 구체적인 방법이나 아이디어가 있나요?",
            "일상생활에서, 혹은 특별한 활동을 통해 어떻게 그 매력을 발휘하고 싶으신가요?",
            "상상했을 때 가장 보람찰 것 같은 활용 방식은 무엇인가요?"
        ]
    ],
    
    // 성장 질문 5 (타인에게서 배우고 싶은 점)
    19: [
        [
            "최근 어떤 사람의 어떤 모습이나 행동을 보고 '배우고 싶다' 또는 '참 괜찮다'고 느꼈나요? (구체적인 상황과 함께 설명해주세요.)",
            "왜 그 모습이 당신에게 인상 깊었나요?",
            "그 사람을 보면서 어떤 감정(예: 존경, 부러움, 감탄 등)을 느꼈나요?"
        ],
        [
            "당신이 인상 깊게 본 그 사람의 모습에서 어떤 구체적인 강점이나 매력이 느껴졌나요? (세부 매력 키워드를 참고해도 좋아요!)",
            "그 매력이 그 사람을 어떻게 더 빛나게 한다고 생각하시나요?",
            "만약 당신에게도 그런 매력이 있다면 어떨 것 같나요?"
        ],
        [
            "그 사람의 좋은 점을 배우기 위해 당신이 당장 실천해 볼 수 있는 아주 작은 행동은 무엇일까요?",
            "그 작은 시도를 꾸준히 한다면 어떤 변화를 기대할 수 있을까요?",
            "그 과정에서 어떤 점이 가장 어려울 것 같고, 어떻게 극복할 수 있을까요?"
        ]
    ],
    
    // 성장 질문 6 (타인의 평가와 자기 인식)
    20: [
        [
            "다른 사람의 어떤 반응이나 평가(칭찬, 비판, 무관심 등)에 당신의 기분이나 자기 생각이 크게 달라지나요?",
            "주로 어떤 관계의 사람(예: 가족, 친구, 직장 동료, 익명의 타인 등)의 평가에 더 민감하게 반응하는 편인가요?",
            "그럴 때 주로 어떤 감정(예: 기쁨, 불안, 슬픔, 위축감 등)을 느끼고, 자신에 대해 어떤 생각을 하게 되나요?"
        ],
        [
            "다른 사람의 평가와는 별개로, 당신이 스스로 생각하기에 '이건 정말 나의 강점이야' 또는 '내 이런 모습은 참 괜찮아'라고 여기는 부분이 있나요? (구체적으로 어떤 점인가요?)",
            "왜 그것이 당신의 강점이나 매력이라고 생각하시나요?",
            "혹시 과거에는 그 강점을 제대로 인정해주지 못했다면, 그 이유는 무엇이었을까요?"
        ],
        [
            "자신의 내면의 목소리에 더 집중하고 스스로의 강점을 믿는다면, 어떤 점이 가장 크게 달라질 것 같나요?",
            "일상생활에서 더 자신감 있고 편안하게 행동하는 당신의 모습은 어떨까요?",
            "자신을 바라보는 관점이 어떻게 긍정적으로 변화할 수 있을지 상상해보세요."
        ]
    ],
    
    // 성장 질문 7 (자기 수용과 관대함)
    21: [
        [
            "당신이 가진 좋은 점이나 성과에 대해 스스로 '별거 아니야'라고 생각하거나 낮춰 평가했던 경험이 있나요? (구체적으로 어떤 모습이나 생각이었나요?)",
            "다른 사람들은 그 부분에 대해 어떻게 평가하거나 반응했었나요?",
            "왜 스스로는 그 부분을 충분히 인정해주기 어려웠다고 생각하시나요?"
        ],
        [
            "스스로의 좋은 점을 있는 그대로 받아들이기 어렵게 만드는 내면의 생각이나 믿음이 있나요?",
            "과거의 어떤 경험이나 타인의 어떤 평가가 현재 당신의 자기 인식에 영향을 주고 있나요?",
            "혹시 완벽주의적인 성향이나 타인과의 비교 때문에 스스로에게 더 엄격해지는 것은 아닐까요?"
        ],
        [
            "과거에 낮춰 보았던 당신의 그 모습을 이제 '소중한 매력'으로 인정한다면, 어떤 점이 가장 크게 달라질 것 같나요?",
            "그 매력을 통해 당신은 어떤 새로운 가능성을 발견하거나 시도해 볼 수 있을까요?",
            "스스로를 더 긍정적으로 바라보게 되면서, 당신의 일상에 어떤 즐거움이나 만족감이 찾아올 것이라고 기대하시나요?"
        ]
    ],
    
    // 성장 질문 8 (아쉬운 점의 반전 매력)
    22: [
        [
            "스스로 생각하기에 '이건 좀 아쉽다' 또는 '이것 때문에 손해 본다'고 느끼는 당신의 모습이나 성향은 무엇인가요?",
            "왜 그 부분이 아쉽다고 생각하시나요? (구체적인 경험이나 이유를 적어보세요.)",
            "그로 인해 어떤 어려움을 겪거나 불편함을 느끼시나요?"
        ],
        [
            "당신이 '아쉬운 점'이라고 생각했던 그 모습이, 다른 각도에서 보면 어떤 긍정적인 면이나 강점으로 보일 수 있을까요?",
            "혹시 그 성향이 특정 상황에서는 오히려 도움이 되었던 경험이 있나요?",
            "'단점'이라고만 생각했던 것에 숨겨진 '가능성'이나 '반전 매력'이 있을지 한번 생각해보세요."
        ],
        [
            "당신의 '아쉬운 점' 이면에 있는 긍정적인 면에 멋진 '반전 매력' 이름을 붙여준다면 무엇일까요?",
            "그 반전 매력을 인정하고 받아들인다면, 당신의 어떤 점이 가장 크게 달라질 것 같나요?",
            "자신을 바라보는 관점이 어떻게 더 긍정적이고 수용적으로 변화할 수 있을지 상상해보세요."
        ]
    ],
    
    // 관계 질문 1 (새로운 관계 시작)
    23: [
        [
            "낯선 사람들과의 어색한 분위기를 풀기 위해 당신이 주로 사용하는 방법은 무엇인가요? (구체적인 말이나 행동)",
            "왜 그 방법이 효과적이라고 생각하시나요?",
            "그 방법을 사용할 때 어떤 마음가짐으로 다가가나요?"
        ],
        [
            "당신의 그런 노력 덕분에 좋은 관계로 이어진 구체적인 경험을 떠올려보세요. (누구와의 관계였나요?)",
            "어떤 과정을 통해 그 관계가 발전하게 되었나요?",
            "그 경험을 통해 관계 맺기에 대해 무엇을 느끼거나 배우게 되었나요?"
        ]
    ],
    
    // 관계 질문 2 (분위기 전환 능력)
    24: [
        [
            "어떤 상황에서 분위기가 무겁거나 어색하다고 느꼈나요? (구체적인 상황 설명)",
            "그때 주변 사람들의 표정이나 반응은 어떠했나요?",
            "당신은 왜 분위기를 바꿔야겠다고 생각했나요?"
        ],
        [
            "분위기를 전환하기 위해 당신이 했던 재치 있는 말이나 행동은 무엇이었나요?",
            "그때 발휘된 당신의 장점이나 매력(예: 유머 감각, 센스, 긍정적 태도 등)은 무엇이라고 생각하시나요?",
            "당신의 행동 이후 분위기가 어떻게 긍정적으로 변화했는지 구체적으로 설명해주세요."
        ]
    ],
    
    // 관계 질문 3 (약속과 책임감)
    25: [
        [
            "당신에게 약속을 지키거나 맡은 역할에 책임을 다하는 것은 얼마나 중요한가요? (매우 중요함, 중요함, 보통 등)",
            "그렇게 생각하는 가장 큰 이유는 무엇인가요? (예: 신뢰, 존중, 공동체 의식, 개인적 양심 등)",
            "만약 약속이나 책임을 지키지 못했을 때 어떤 기분이 드나요?"
        ],
        [
            "어떤 어려운 상황에서도 약속이나 책임을 지키려고 노력했던 구체적인 경험을 떠올려보세요.",
            "그 과정에서 어떤 어려움이나 갈등이 있었나요?",
            "그럼에도 불구하고 약속이나 책임을 지켜낼 수 있었던 당신의 강점이나 좋은 점은 무엇이었다고 생각하시나요?"
        ]
    ],
    
    // 관계 질문 4 (다른 생각 존중)
    26: [
        [
            "나와 생각이 매우 다른 사람과 중요한 의견을 나눠야 했던 상황을 떠올려보세요. (어떤 주제였고, 상대방의 의견은 무엇이었나요?)",
            "그때 상대방의 입장을 이해하고 존중하기 위해 어떤 노력을 기울였나요? (예: 끝까지 듣기, 질문하기, 공감 표현하기 등)",
            "그 과정에서 어떤 점이 가장 어려웠나요?"
        ],
        [
            "다른 관점을 가진 사람과 좋은 대화를 만드는 데 도움이 된 당신의 가장 중요한 태도나 자세는 무엇이었나요? (1~2가지)",
            "그 태도가 대화에 어떤 긍정적인 영향을 미쳤다고 생각하시나요?",
            "만약 그런 태도가 없었다면 대화가 어떻게 흘러갔을 것 같나요?"
        ]
    ],
    
    // 관계 질문 5 (함께하는 즐거움)
    27: [
        [
            "다른 사람들과 함께 계획하고 실행하여 모두가 즐거워했던 경험은 무엇이었나요? (언제, 누구와, 어떤 활동이었나요?)",
            "그 활동을 통해 어떤 즐거움이나 만족감을 느꼈나요?",
            "다른 참여자들의 반응은 어떠했나요?"
        ],
        [
            "그 활동 과정에서 당신은 주로 어떤 역할을 맡았나요? (예: 아이디어 제시, 계획 수립, 분위기 조성, 실행 등)",
            "그 역할을 잘 수행하는 데 도움이 된 당신의 내적인 매력이나 강점은 무엇이었다고 생각하시나요?",
            "당신의 그 매력 덕분에 팀이나 그룹 전체에 어떤 긍정적인 영향을 줄 수 있었나요?"
        ]
    ],
    
    // 관계 질문 6 (오해와 관계 회복)
    28: [
        [
            "친구, 가족, 동료 등 가까운 사람과 오해가 생겨 마음이 상했던 경험을 떠올려보세요. (어떤 상황이었고, 왜 오해가 생겼나요?)",
            "그때 당신의 감정은 어떠했나요?",
            "관계를 회복하고 싶다는 생각을 하게 된 계기는 무엇이었나요?"
        ],
        [
            "먼저 다가가거나 관계 회복을 위해 노력하는 데 어떤 마음가짐이나 생각이 가장 큰 영향을 주었나요?",
            "그 행동을 하는 것이 어렵거나 망설여졌다면, 그 이유는 무엇이었나요?",
            "그럼에도 불구하고 용기를 낼 수 있었던 당신 안의 힘은 무엇이었을까요?"
        ],
        [
            "관계를 회복하기 위한 용기 있는 선택을 하는 데 도움이 된 당신의 성격, 가치관, 또는 능력은 무엇이었나요?",
            "그 과정에서 당신의 어떤 좋은 점이 발휘되었다고 생각하시나요?",
            "그 경험을 통해 관계 맺기나 갈등 해결에 대해 새롭게 배운 점이 있나요?"
        ]
    ],
    
    // 관계 질문 7 (타인에게 힘이 되어준 경험)
    29: [
        [
            "주변 사람(친구, 가족, 동료 등)이 어떤 힘든 시간을 보내고 있었나요?",
            "그때 당신은 그 사람에게 어떤 따뜻한 말이나 행동으로 힘을 주려고 했나요? (구체적으로 설명해주세요.)",
            "왜 그런 말이나 행동을 해야겠다고 생각했나요?"
        ],
        [
            "당신의 어떤 태도나 마음가짐이 상대방에게 위로와 용기를 주었다고 생각하시나요? (예: 진정성, 공감, 긍정성, 인내심 등)",
            "상대방이 당신의 도움으로 기운을 차리는 모습을 보았을 때 어떤 기분이 들었나요?",
            "그 경험을 통해 타인과의 관계에서 무엇이 중요하다고 느끼게 되었나요?"
        ]
    ]
};

// ==================== 템플릿 모달 함수 ====================
// 기존 showTemplate 함수를 완전히 교체
function showTemplate(questionId, subIndex) {
    // 현재 질문 정보 저장
    window.currentQuestionId = questionId;
    window.currentSubIndex = subIndex;
    
    console.log('템플릿 모달 열기:', questionId, subIndex);
    
    // 해당 질문의 템플릿 데이터 찾기
    const templates = TEMPLATE_DATA[questionId];
    
    if (!templates || !templates[subIndex]) {
        console.error('템플릿 데이터를 찾을 수 없습니다:', questionId, subIndex);
        alert('템플릿 데이터를 불러올 수 없습니다.');
        return;
    }
    
    const currentTemplates = templates[subIndex];
    const content = document.getElementById('templateContent');
    
    // 개선된 템플릿 내용 생성
    let html = `
        <div class="template-header">
            <h4 style="color: #5a67d8; margin-bottom: 15px;">📝 글쓰기 템플릿</h4>
            <p style="font-size: 14px; color: #718096; margin-bottom: 20px;">
                아래 가이드 질문들에 답변을 작성한 후, "템플릿 사용하기" 버튼을 누르면 답변이 자동으로 조합되어 메인 답변창에 입력됩니다.
            </p>
        </div>
        
        <div class="template-questions">
    `;
    
    currentTemplates.forEach((template, index) => {
        html += `
            <div class="template-question-item">
                <div class="template-question-header">
                    <span class="template-letter">${String.fromCharCode(97 + index)}</span>
                    <span class="template-question-text">${template}</span>
                </div>
                <textarea 
                    class="template-answer-input" 
                    placeholder="이 질문에 대한 답변을 작성해주세요..."
                    id="templateAnswer_${index}"
                    rows="3"
                ></textarea>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div class="template-footer">
            <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; font-size: 13px; color: #4c51bf; margin: 20px 0;">
                💡 <strong>사용법:</strong> 각 질문에 간단히 답변을 작성한 후, "템플릿 사용하기" 버튼을 누르면 답변들이 자연스럽게 조합되어 메인 답변창에 자동 입력됩니다.
            </div>
            <div style="text-align: center;">
                <button class="template-use-btn" onclick="useTemplate()">
                    ✨ 템플릿 사용하기
                </button>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    document.getElementById('templateModal').style.display = 'block';
}

// 템플릿 사용하기 함수
function useTemplate() {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    
    if (!questionId || subIndex === undefined) {
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        return;
    }
    
    // 각 템플릿 답변 수집
    const answers = [];
    const templateInputs = document.querySelectorAll('.template-answer-input');
    
    templateInputs.forEach((input, index) => {
        const answer = input.value.trim();
        if (answer) {
            const letter = String.fromCharCode(97 + index); // a, b, c
            answers.push(`${letter}. ${answer}`);
        }
    });
    
    if (answers.length === 0) {
        alert('최소 하나의 질문에는 답변을 작성해주세요.');
        return;
    }
    
    // 답변들을 자연스럽게 조합
    const combinedAnswer = answers.join('\n\n');
    
    // 메인 답변창에 입력
    const mainTextarea = document.getElementById(`reflection_${questionId}_${subIndex}`);
    if (mainTextarea) {
        // 기존 내용이 있으면 추가, 없으면 새로 입력
        const existingContent = mainTextarea.value.trim();
        if (existingContent) {
            mainTextarea.value = existingContent + '\n\n' + combinedAnswer;
        } else {
            mainTextarea.value = combinedAnswer;
        }
        
   
        
        // 모달 닫기 - 여러 방법으로 시도
const templateModal = document.getElementById('templateModal');
if (templateModal) {
    templateModal.style.display = 'none';
}

// closeModal 함수가 있다면 사용
if (typeof closeModal === 'function') {
    closeModal('templateModal');
}
        
        // 메인 답변창에 포커스
        mainTextarea.focus();
        
    } else {
        alert('답변창을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
    }
}

// ==================== 매력 키워드 시스템 (완전 새 버전) ====================

// 매력 키워드 모달 열기 함수
function showAttractionKeywords(questionId, subIndex) {
    // 현재 질문 정보 저장
    window.currentQuestionId = questionId;
    window.currentSubIndex = subIndex;
    window.tempSelectedKeywords = []; // 임시 선택 키워드 저장
    
    console.log('매력 키워드 모달 열기:', questionId, subIndex);
    
    const content = document.getElementById('attractionContent');
    
    // 매력 키워드 데이터 (원본 데이터 사용)
    const attractionKeywords = {
        "이해심 및 공감 능력": ["다정함", "공감 능력", "이해심", "배려심", "경청 능력", "위로 능력", "섬세함"],
        "성실성 및 책임감": ["성실함", "책임감", "인내심", "계획성", "세심함", "신중함", "절제력"],
        "지적 호기심 및 개방성": ["호기심", "창의성", "열린 마음", "모험심", "비판적 사고력", "통찰력", "넓은 시야", "집중력"],
        "정서적 안정 및 자기 인식": ["침착함", "안정감", "자기 성찰", "긍정적", "현실 감각", "자기 객관화", "자존감", "겸손"],
        "도덕성 및 양심": ["정직함", "양심", "일관성", "원칙 준수", "진정성", "약자보호"],
        "유머감각 및 사교성": ["유머 감각", "분위기 메이커", "다양한 친분", "타인을 편하게 해주는 능력", "연락 등 관계를 이어가는 능력", "사교적 에너지"],
        "목표 지향성 및 야망": ["목표 의식", "열정", "자기 계발 의지", "리더십", "야망", "경쟁심", "전략적 사고"]
    };
    
    let html = `
        <div class="attraction-guide">
            <div class="attraction-guide-icon">✨</div>
            <div class="attraction-guide-text">
                <strong>매력 키워드를 참고해서 답변을 더 풍부하게 만들어보세요!</strong><br>
                원하는 키워드를 클릭해서 선택한 후, "선택 완료" 버튼을 눌러주세요.
            </div>
        </div>
        
        <div class="attraction-keywords">
    `;
    
    // 각 카테고리별 키워드 생성
    Object.entries(attractionKeywords).forEach(([category, keywords]) => {
        html += `
            <div class="attraction-category">
                <div class="attraction-category-title">${category}</div>
                <div class="attraction-keywords-list">
                    ${keywords.map(keyword => `
                        <span class="attraction-keyword" onclick="toggleKeywordSelection('${keyword}', this)">
                            ${keyword}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
    `;
    
    content.innerHTML = html;
    document.getElementById('attractionModal').style.display = 'block';
}

// 키워드 선택/해제 토글 함수
function toggleKeywordSelection(keyword, element) {
    console.log('키워드 토글:', keyword);
    
    // 임시 선택 키워드 배열 초기화
    if (!window.tempSelectedKeywords) {
        window.tempSelectedKeywords = [];
    }
    
    const index = window.tempSelectedKeywords.indexOf(keyword);
    
    if (index === -1) {
        // 선택: 키워드 추가 및 스타일 변경
        window.tempSelectedKeywords.push(keyword);
        element.classList.add('selected');
        console.log('키워드 선택됨:', keyword);
    } else {
        // 해제: 키워드 제거 및 스타일 원복
        window.tempSelectedKeywords.splice(index, 1);
        element.classList.remove('selected');
        console.log('키워드 해제됨:', keyword);
    }
    
    // 선택된 키워드 개수 업데이트
    updateSelectedCount();
    
    console.log('현재 선택된 키워드들:', window.tempSelectedKeywords);
}

// 선택된 키워드 개수 업데이트
function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement && window.tempSelectedKeywords) {
        countElement.textContent = `선택된 키워드: ${window.tempSelectedKeywords.length}개`;
    }
}

// 키워드 선택 완료 함수
function completeKeywordSelection() {
    const questionId = window.currentQuestionId;
    const subIndex = window.currentSubIndex;
    const selectedKeywords = window.tempSelectedKeywords || [];
    
    if (selectedKeywords.length === 0) {
        alert('최소 1개의 키워드를 선택해주세요.');
        return;
    }
    
    console.log('키워드 선택 완료:', selectedKeywords);
    
    // 키워드를 메인 답변창 위 해시태그 영역에 추가
    addKeywordsToAnswer(questionId, subIndex, selectedKeywords);
    
    // 모달 닫기
    closeModal('attractionModal');
    
    // 임시 선택 키워드 초기화
    window.tempSelectedKeywords = [];
    
    // 성공 메시지 (선택사항)
    // alert(`${selectedKeywords.length}개의 키워드가 추가되었습니다!`);
}

// 키워드를 답변창에 추가하는 함수
function addKeywordsToAnswer(questionId, subIndex, keywords) {
    const keywordsContainer = document.getElementById(`selectedKeywords_${questionId}_${subIndex}`);
    if (!keywordsContainer) {
        console.error('키워드 컨테이너를 찾을 수 없습니다:', `selectedKeywords_${questionId}_${subIndex}`);
        return;
    }
    
    const tagsContainer = keywordsContainer.querySelector('.keywords-tags');
    if (!tagsContainer) {
        console.error('태그 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    // 기존 키워드와 중복 확인
    const existingKeywords = Array.from(tagsContainer.querySelectorAll('.keyword-tag')).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
    
    // "키워드 없음" 메시지 제거
    const noKeywordsMsg = tagsContainer.querySelector('.no-keywords');
    if (noKeywordsMsg) {
        noKeywordsMsg.remove();
    }
    
    // 새로운 키워드들 추가
    keywords.forEach(keyword => {
        if (!existingKeywords.includes(keyword)) {
            const keywordTag = document.createElement('div');
            keywordTag.className = 'keyword-tag';
            keywordTag.innerHTML = `
                ${keyword}
                <button class="remove-btn" onclick="removeKeyword(this, '${questionId}', ${subIndex})" title="키워드 제거">&times;</button>
            `;
            
            // 애니메이션 효과
            keywordTag.style.opacity = '0';
            keywordTag.style.transform = 'scale(0.8)';
            tagsContainer.appendChild(keywordTag);
            
            // 애니메이션 실행
            setTimeout(() => {
                keywordTag.style.transition = 'all 0.3s ease';
                keywordTag.style.opacity = '1';
                keywordTag.style.transform = 'scale(1)';
            }, 10);
        }
    });
    
    console.log('키워드가 답변창에 추가됨:', keywords);
}

// 개별 키워드 제거 함수
function removeKeyword(button, questionId, subIndex) {
    const tag = button.parentElement;
    const keyword = tag.textContent.replace('×', '').trim();
    
    // 애니메이션과 함께 제거
    tag.style.transition = 'all 0.3s ease';
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        tag.remove();
        
        // 키워드가 모두 제거되면 "키워드 없음" 메시지 표시
        const tagsContainer = tag.parentElement;
        if (tagsContainer && tagsContainer.children.length === 0) {
            const noKeywordsMsg = document.createElement('div');
            noKeywordsMsg.className = 'no-keywords';
            noKeywordsMsg.textContent = '아직 선택된 키워드가 없습니다';
            tagsContainer.appendChild(noKeywordsMsg);
        }
    }, 300);
    
    console.log(`키워드 "${keyword}" 제거됨`);
}

// 모달 닫기 함수 (기존 함수가 없다면 추가)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 전역 변수 초기화
window.currentQuestionId = null;
window.currentSubIndex = null;
window.tempSelectedKeywords = [];

console.log('✅ 매력 키워드 시스템 초기화 완료!');
// 템플릿 사용 성공 메시지

// 기존 renderSurvey 함수를 완전히 교체
function renderSurvey() {
    const container = document.getElementById('surveyContainer');
    
    container.innerHTML = `
        <!-- 설문 안내 메시지 -->
        <div style="background: #f0f4ff; border-radius: 10px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #5a67d8;">
            <p style="margin: 0; color: #4c51bf; line-height: 1.6;">
                <strong>안녕하세요! ASTER의 '내적 매력 탐구 프로그램'을 경험해주셔서 감사합니다.</strong><br>
                본 설문은 ASTER 프로그램을 개선하고 더 나은 경험을 제공하고자 마련된 테스트 버전입니다.<br>
                잠시 시간을 내어 프로그램의 효과, 개선점 등에 대한 소중한 의견을 들려주시길 부탁드립니다. 
                <strong>(예상 소요 시간: 약 5분)</strong>
            </p>
        </div>
        
        <form id="surveyForm">
            <!-- I. 프로그램 전반적 평가 -->
            <div class="survey-section">
                <div class="survey-section-title">I. 프로그램 전반적 평가</div>
                
                <div class="survey-question">
                    <div class="survey-question-title">
                        1. ASTER 매력 탐구 프로그램(1단계~3단계)에 전반적으로 얼마나 만족하셨나요? *
                    </div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="overall_satisfaction" value="${num}" required>
                                <div class="rating-label">${num === 1 ? '매우<br>불만족' : num === 2 ? '불만족' : num === 3 ? '보통' : num === 4 ? '만족' : '매우<br>만족'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        2. 이 프로그램이 당신의 '내적 매력'을 새롭게 발견하거나 기존 매력을 더 잘 이해하는 데 얼마나 도움이 되었다고 생각하시나요? *
                    </div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="discovery_help" value="${num}" required>
                                <div class="rating-label">${num === 1 ? '매우 도움<br>안 됨' : num === 2 ? '도움<br>안 됨' : num === 3 ? '보통' : num === 4 ? '도움 됨' : '매우<br>도움 됨'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        3. 이 프로그램을 다른 사람에게 추천할 의향이 얼마나 있으신가요? *
                    </div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="recommendation" value="${num}" required>
                                <div class="rating-label">${num === 1 ? '전혀<br>추천 안 함' : num === 2 ? '별로 추천<br>안 함' : num === 3 ? '보통' : num === 4 ? '추천함' : '매우<br>추천함'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- II. 프로그램 단계별 및 기능별 평가 -->
            <div class="survey-section">
                <div class="survey-section-title">II. 프로그램 단계별 및 기능별 평가</div>
                
                <div class="survey-question">
                    <div class="survey-question-title">
                        다음 각 단계가 당신의 매력을 발견하고 이해하는 데 얼마나 도움이 되었는지 평가해주세요. *<br>
                        <small style="color: #718096;">(척도: ① 매우 도움 안 됨 - ② 도움 안 됨 - ③ 보통 - ④ 도움 됨 - ⑤ 매우 도움 됨)</small>
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">1단계 (매력 카테고리 1~3개 선택):</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="stage1_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">2단계 (4지선다 상황 질문 & 2지선다 성향 질문, 총 8개):</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="stage2_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">3단계 (심층 성찰 주관식 질문 4개 및 보조 기능):</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="stage3_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        프로그램 전체 과정 중, 가장 개선이 필요하다고 생각되는 부분이나 가장 혼란스러웠던 단계 또는 기능 한 가지를 선택해주세요. *
                    </div>
                    <select class="dropdown-select" name="needs_improvement" required>
                        <option value="">선택해주세요</option>
                        <option value="1단계 카테고리 선택">1단계 카테고리 선택</option>
                        <option value="2단계 4지선다 질문 (상황)">2단계 4지선다 질문 (상황)</option>
                        <option value="2단계 2지선다 질문 (성향)">2단계 2지선다 질문 (성향)</option>
                        <option value="3단계 성찰 질문">3단계 성찰 질문</option>
                        <option value="3단계 답변 예시">3단계 답변 예시</option>
                        <option value="3단계 글쓰기 템플릿">3단계 글쓰기 템플릿</option>
                        <option value="3단계 매력 리스트 참고">3단계 매력 리스트 참고</option>
                        <option value="건너뛰기 옵션">건너뛰기 옵션</option>
                        <option value="기타">기타</option>
                    </select>
                    <textarea class="text-input" name="improvement_reason" placeholder="(선택 사항) 이유를 간략히 적어주세요..." style="min-height: 80px; margin-top: 10px;"></textarea>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        3단계 심층 성찰 질문에서 제공된 다음 사용자 보조 기능들은 각각 얼마나 유용했나요? *<br>
                        <small style="color: #718096;">(척도: ① 매우 유용하지 않음 - ② 유용하지 않음 - ③ 보통 - ④ 유용함 - ⑤ 매우 유용함)</small>
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">3단계 시작 전 온보딩 메시지:</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="onboarding_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">건너뛰기 옵션 (다른 질문 보기, 나중에 답하기, 답변 그만하기):</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="skip_option_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">답변 예시 보기:</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="example_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">글쓰기 템플릿 사용:</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="template_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">세부 매력 리스트 참고:</div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="keywords_rating" value="${num}" required>
                                <div class="rating-label">${num}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- III. 프로그램 경험 및 발전 방향에 대한 의견 -->
            <div class="survey-section">
                <div class="survey-section-title">III. 프로그램 경험 및 발전 방향에 대한 의견</div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        1. 이 프로그램을 통해 얻은 가장 긍정적인 경험이나 깨달음을 얻었던 순간이 있다면 간략하게 적어주세요.<br>
                        <small style="color: #718096;">(선택 사항, 예: 새롭게 알게 된 나의 매력, 특정 질문에 대한 답변 과정 등)</small>
                    </div>
                    <textarea class="text-input" name="positive_experience" placeholder="긍정적인 경험이나 깨달음을 자유롭게 적어주세요..."></textarea>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        2. 프로그램을 경험한 후, 이전보다 자신의 '내적 매력'에 대해 더 명확하게 이해하게 되었다고 느끼시나요? *
                    </div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="understanding_improvement" value="${num}" required>
                                <div class="rating-label">${num === 1 ? '전혀<br>그렇지 않다' : num === 2 ? '별로<br>그렇지 않다' : num === 3 ? '보통' : num === 4 ? '어느 정도<br>그렇다' : '매우<br>그렇다'}</div>
                            </div>
                        `).join('')}
                    </div>
                    <textarea class="text-input" name="understanding_reason" placeholder="(선택 사항) 그렇게 생각하시는 이유를 간략히 적어주세요..." style="min-height: 80px; margin-top: 15px;"></textarea>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        3. 이 프로그램이 자신에 대해 좀 더 긍정적으로 생각하는 데 도움이 되었다고 느끼시나요? *
                    </div>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <div class="rating-item">
                                <input type="radio" name="positivity_improvement" value="${num}" required>
                                <div class="rating-label">${num === 1 ? '전혀<br>그렇지 않다' : num === 2 ? '별로<br>그렇지 않다' : num === 3 ? '보통' : num === 4 ? '어느 정도<br>그렇다' : '매우<br>그렇다'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="survey-question">
                    <div class="survey-question-title">
                        4. ASTER 프로그램에 새롭게 추가되거나 더 발전되었으면 하는 내용, 기능, 또는 활동이 있다면 자유롭게 제안해주세요.<br>
                        <small style="color: #718096;">(선택 사항, 예: 특정 주제의 질문 추가, 다른 방식의 매력 탐색 활동, 친구와 공유 기능 등)</small>
                    </div>
                    <textarea class="text-input" name="development_suggestion" placeholder="추가/발전 제안을 자유롭게 적어주세요..."></textarea>
                </div>
            </div>
        </form>
        
        <!-- 감사 메시지 -->
        <div style="background: #f0fff4; border-radius: 10px; padding: 20px; margin-top: 30px; border-left: 4px solid #48bb78; text-align: center;">
            <p style="margin: 0; color: #2f855a; font-weight: bold;">
                🙏 소중한 의견을 공유해주셔서 진심으로 감사드립니다.<br>
                보내주신 피드백은 ASTER 프로그램을 더욱 발전시키는 데 큰 힘이 될 것입니다.
            </p>
        </div>
    `;
    
    // 설문 응답 상태 체크 함수 추가
    setupSurveyValidation();
}

// 설문 유효성 검사 함수
// 기존 setupSurveyValidation 함수를 다음과 같이 수정하세요 (4080줄 이후 어딘가에 있을 것입니다):

function setupSurveyValidation() {
    const form = document.getElementById('surveyForm');
    let submitBtn = document.getElementById('surveySubmitBtn');
    
    // 버튼이 없으면 찾아보기
    if (!submitBtn) {
        submitBtn = document.querySelector('.btn[onclick*="submitSurvey"]');
    }
    
    console.log('Submit button found:', submitBtn); // 디버깅용
    
    // 필수 필드들
    const requiredFields = [
        'overall_satisfaction',
        'discovery_help', 
        'recommendation',
        'stage1_rating',
        'stage2_rating', 
        'stage3_rating',
        'needs_improvement',
        'onboarding_rating',
        'skip_option_rating',
        'example_rating',
        'template_rating',
        'keywords_rating',
        'understanding_improvement',
        'positivity_improvement'
    ];
    
    function checkFormCompletion() {
        const allCompleted = requiredFields.every(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]:checked`) || 
                         form.querySelector(`[name="${fieldName}"]`);
            return field && field.value;
        });
        
        console.log('Form completion status:', allCompleted); // 디버깅용
        
        if (submitBtn) {
            submitBtn.disabled = !allCompleted;
            if (allCompleted) {
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            } else {
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            }
        }
    }
    
    // 모든 input과 select에 이벤트 리스너 추가
    if (form) {
        form.addEventListener('change', checkFormCompletion);
        form.addEventListener('input', checkFormCompletion);
        
        // 초기 상태 체크
        setTimeout(checkFormCompletion, 100); // 약간의 지연 후 체크
    }
}

console.log('✅ 템플릿 시스템 초기화 완료 - 29개 질문 템플릿 데이터 로드됨');