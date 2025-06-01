// 기존 loadUserData 함수를 이렇게 수정:
async function loadUserData() {
    try {
        console.log('📊 사용자 데이터 로딩 시작...');
        
        // 실제 컬렉션 이름 사용
        const usersRef = window.collection(window.db, 'complete_responses');
        const querySnapshot = await window.getDocs(usersRef);
        
        userData = [];
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('📄 문서 데이터:', data);
                
                userData.push({
                    id: doc.id,
                    userId: data.userId,
                    timestamp: data.timestamp,
                    completed: data.completed,
                    stage1_selections: data.stage1_selections || [],
                    stage2_situation_responses: data.stage2_situation_responses || [],
                    stage2_personality_responses: data.stage2_personality_responses || [],
                    stage3_responses: data.stage3_responses || {},
                    survey_responses: data.survey_responses || {}
                });
            });
            
            console.log(`✅ 사용자 데이터 ${userData.length}개 로드 완료`);
        } else {
            console.log('📁 아직 완료된 테스트 데이터가 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error);
        userData = [];
        showError('사용자 데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 기존 loadSurveyData 함수도 수정:
async function loadSurveyData() {
    try {
        console.log('📋 설문 데이터 로딩 시작...');
        
        // complete_responses에서 설문 데이터 추출
        const usersRef = window.collection(window.db, 'complete_responses');
        const querySnapshot = await window.getDocs(usersRef);
        
        surveyData = [];
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // 설문 응답이 있는 데이터만 추가
                if (data.survey_responses && Object.keys(data.survey_responses).length > 0) {
                    surveyData.push({
                        id: doc.id,
                        userId: data.userId,
                        timestamp: data.timestamp,
                        ...data.survey_responses
                    });
                }
            });
            
            console.log(`✅ 설문 데이터 ${surveyData.length}개 로드 완료`);
        } else {
            console.log('📋 아직 설문 응답이 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 설문 데이터 로드 실패:', error);
        surveyData = [];
        showError('설문 데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// debugFirestore 함수도 업데이트:
async function debugFirestore() {
    try {
        console.log('🔍 Firebase 컬렉션 탐색 시작...');
        
        // 실제 컬렉션 확인
        const ref = window.collection(window.db, 'complete_responses');
        const snapshot = await window.getDocs(ref);
        
        if (!snapshot.empty) {
            console.log(`✅ 발견! 컬렉션 "complete_responses": ${snapshot.size}개 문서`);
            
            // 첫 번째 문서의 구조 확인
            const firstDoc = snapshot.docs[0];
            console.log('📄 샘플 데이터 구조:', firstDoc.data());
            
            // 각 문서의 기본 정보 표시
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`📋 문서 ID: ${doc.id}`, {
                    userId: data.userId,
                    completed: data.completed,
                    timestamp: data.timestamp,
                    hasStage1: !!data.stage1_selections,
                    hasStage2Situation: !!data.stage2_situation_responses,
                    hasStage2Personality: !!data.stage2_personality_responses,
                    hasStage3: !!data.stage3_responses,
                    hasSurvey: !!data.survey_responses
                });
            });
        } else {
            console.log('📁 컬렉션 "complete_responses"가 비어있습니다.');
        }
        
        console.log('🔍 컬렉션 탐색 완료');
        
    } catch (error) {
        console.error('❌ 디버깅 실패:', error);
    }
}

