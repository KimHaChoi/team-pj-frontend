import type { Report } from '../types';

interface GeminiResponse {
  score: number;
  isMeaningful: boolean;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const aiService = {
  /**
   * Analyze citizen report using Google Gemini 1.5 Flash API or smart local fallback
   */
  async analyzeReport(
    category: Report['category'],
    description: string = '',
    lat: number,
    lng: number
  ): Promise<GeminiResponse> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const cleanDesc = description.trim();

    // 1. Fallback heuristic analysis if key is missing or string is trivial/spam
    const isJunk = cleanDesc.length < 3 || 
                   /^(test|테스트|ㅁㄴㅇㄹ|asdf|qwerty|1234|abc|ㅎㅇ|하이)$/i.test(cleanDesc) ||
                   (cleanDesc === '' && category === 'ETC');

    if (isJunk) {
      return {
        score: Math.floor(Math.random() * 15) + 10, // 10 to 24
        isMeaningful: false,
        reason: '신고 내용이 너무 짧거나 단순 자음/모음, 혹은 장난성 입력으로 판단되어 무의미한 민원으로 자동 분류되었습니다.',
        riskLevel: 'LOW'
      };
    }

    if (!apiKey || apiKey === '' || apiKey.includes('YOUR_')) {
      console.log('ℹ️ VITE_GEMINI_API_KEY is not defined. Using Smart Heuristic Fallback Analysis.');
      return this.smartHeuristicFallback(category, cleanDesc);
    }

    try {
      // 2. Direct client-side Google Gemini REST API call
      const prompt = `
너는 지자체 환경·에너지 신고를 분류하고 가치를 평가하는 스마트 시티 AI 전문 분석관이다.
전달받은 신고 카테고리, 신고자가 작성한 텍스트 설명을 바탕으로 다음 5가지 기준에 맞춰 엄격하고 공정하게 평가해라.

[평가 기준]
1. 실제 환경오염 또는 에너지 낭비가 진행 중이거나 발생할 가능성이 높은가?
2. 공공 안전(가로등 꺼짐으로 인한 우범화 등)에 위험성이 높은가?
3. 전파 가능성이 있어 빠른 조치가 필요한가?
4. 사용자가 선택한 카테고리와 설명이 일치하고 정상적인 신고로 간주되는가?
5. 장난성이거나 단순 허위, 아무 관련 없는 무의미한 신고인가?

[의미 없는 신고 판정 규칙 (isMeaningful: false)]
- 카테고리와 아무런 연관이 없는 내용이거나, "테스트", "ㅁㄴㅇㄹ" 같은 무지성 텍스트 입력인 경우.

[응답 포맷]
반드시 아래 정의된 JSON 구조로만 답변해야 하며, 백틱(\`\`\`json)이나 마크다운 포맷, 다른 설명 텍스트를 절대 추가하지 마라. 오직 순수 JSON 문자열만 반환해라.

{
  "score": <0부터 100 사이의 정수>,
  "isMeaningful": <true 또는 false>,
  "reason": "<평가 기준에 따른 구체적 점수 산정 이유와 정황 분석 요약. 1~2문장의 자연스러운 한글 문자열>",
  "riskLevel": "<LOW, MEDIUM, HIGH 중 하나>"
}

[신고 데이터 정보]
- 카테고리: ${category}
- 신고 설명: ${description}
- 위도/경도: ${lat}, ${lng}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API Http Error: ${response.status}`);
      }

      const responseData = await response.json();
      const textResult = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResult) {
        throw new Error('Empty response from Gemini API candidates');
      }

      // Parse JSON from Gemini
      const parsed: GeminiResponse = JSON.parse(textResult.trim());
      
      // Post validation sanity check
      return {
        score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 50,
        isMeaningful: typeof parsed.isMeaningful === 'boolean' ? parsed.isMeaningful : true,
        reason: parsed.reason || 'AI 분석이 완료되었습니다. 조치가 시급히 요구되는 민원입니다.',
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel) ? parsed.riskLevel : 'MEDIUM'
      };

    } catch (error) {
      console.error('❌ Gemini API call failed. Falling back to Heuristic Engine:', error);
      return this.smartHeuristicFallback(category, cleanDesc);
    }
  },

  /**
   * Smart heuristic fallback analysis when API key is missing or fails
   */
  smartHeuristicFallback(category: Report['category'], description: string): GeminiResponse {
    let score = 50;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    let isMeaningful = true;
    let reason = '';

    const text = description.toLowerCase();

    switch (category) {
      case 'ENERGY_WASTE':
        if (text.includes('가로등') || text.includes('조명') || text.includes('낮')) {
          score = Math.floor(Math.random() * 10) + 78; // 78 to 87
          riskLevel = 'HIGH';
          reason = '주간 시간대 가로등 상시 점등 문제로 감지되었습니다. 실시간 기상/광량 정보 분석을 통한 센서 점검 및 즉각적인 전력 낭비 차단 조치가 필요합니다.';
        } else {
          score = Math.floor(Math.random() * 15) + 60; // 60 to 74
          riskLevel = 'MEDIUM';
          reason = '공공 또는 산업 시설물 전력 과소모/에너지 낭비 사각지대가 접수되었습니다. 현장 검토 후 전원 차단 유도가 적절합니다.';
        }
        break;

      case 'POLLUTION':
        if (text.includes('매연') || text.includes('연기') || text.includes('공장') || text.includes('유독')) {
          score = Math.floor(Math.random() * 10) + 85; // 85 to 94
          riskLevel = 'HIGH';
          reason = '대형 산업단지 대기 유독 매연 배출로 인한 오염 확산 및 호흡기 안전 위해 가능성이 매우 큽니다. 단속반 긴급 투입을 권장합니다.';
        } else if (text.includes('물') || text.includes('폐수') || text.includes('하천')) {
          score = Math.floor(Math.random() * 10) + 80; // 80 to 89
          riskLevel = 'HIGH';
          reason = '인근 농가 및 하천 유입 수질오염 침출수 유출 정황이 관찰됩니다. 토양 오염 및 농업용수 오염 방지를 위해 신속 조치가 시급합니다.';
        } else {
          score = Math.floor(Math.random() * 15) + 65; // 65 to 79
          riskLevel = 'MEDIUM';
          reason = '국지적 대기/수질 오염 물질 방치 건이 관찰되었습니다. 조속히 오염원 시료 채취 및 계도 조치가 요구됩니다.';
        }
        break;

      case 'ILLEGAL_DUMPING':
        if (text.includes('폐기물') || text.includes('드럼') || text.includes('페인트') || text.includes('유해')) {
          score = Math.floor(Math.random() * 10) + 75; // 75 to 84
          riskLevel = 'HIGH';
          reason = '인근 야산 주변에 인화성 또는 부식성 위험 폐기물이 무단 방치되어 토양 오염 및 화재 안전을 위협합니다. 조속한 수거가 요구됩니다.';
        } else {
          score = Math.floor(Math.random() * 15) + 55; // 55 to 69
          riskLevel = 'MEDIUM';
          reason = '구역 사각지대에 가구 또는 일반 생활쓰레기 무단 불법 투기가 확인되었습니다. CCTV 판독 및 과태료 부과 등의 상시 조치를 건의합니다.';
        }
        break;

      case 'NOISE':
        if (text.includes('새벽') || text.includes('밤') || text.includes('잠')) {
          score = Math.floor(Math.random() * 15) + 65; // 65 to 79
          riskLevel = 'MEDIUM';
          reason = '수면 시간대 상업/공사 현장 발생 고소음 피해 건으로 주민 생활 평온권 수호를 위해 한도 초과 측정 및 강력 제재가 타당해 보입니다.';
        } else {
          score = Math.floor(Math.random() * 15) + 45; // 45 to 59
          riskLevel = 'LOW';
          reason = '주간 공공구역 이동 차량 또는 도로 마찰성 생활 소음 건입니다. 시간대별 공사 일정 조율 권고 수준이 적합합니다.';
        }
        break;

      case 'ETC':
      default:
        score = Math.floor(Math.random() * 20) + 40; // 40 to 59
        riskLevel = 'MEDIUM';
        reason = '일반 시민 안전 정황이 접수되었습니다. 사진 정밀 판독과 함께 행정 지침에 따라 처리반을 순차 배정하여 확인 바랍니다.';
        break;
    }

    return {
      score,
      isMeaningful,
      reason,
      riskLevel
    };
  }
};
