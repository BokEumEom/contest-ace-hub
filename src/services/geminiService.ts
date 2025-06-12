
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Gemini API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Gemini API key');
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      return false;
    }
  }

  async generateIdeas(contestTitle: string, contestDescription: string): Promise<string[]> {
    const prompt = `
공모전 정보:
제목: ${contestTitle}
설명: ${contestDescription}

위 공모전을 위한 창의적이고 실현 가능한 아이디어 5개를 제안해주세요. 
각 아이디어는:
1. 구체적이고 실행 가능해야 함
2. 공모전 주제와 밀접한 관련이 있어야 함
3. 차별화된 접근 방식을 포함해야 함

형식: 각 아이디어를 "아이디어 N: [제목] - [간단한 설명]" 형식으로 작성해주세요.
`;

    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // 아이디어를 배열로 분리
      const ideas = text.split('\n')
        .filter(line => line.trim().startsWith('아이디어'))
        .map(line => line.trim());

      return ideas;
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw error;
    }
  }

  async reviewDocument(documentContent: string, documentType: string): Promise<string> {
    const prompt = `
다음 ${documentType} 문서를 검토해주세요:

${documentContent}

다음 관점에서 검토 의견을 제공해주세요:
1. 문법 및 맞춤법 오류
2. 문서 구조 및 논리적 흐름
3. 내용의 완성도
4. 개선 제안사항

구체적이고 실행 가능한 피드백을 제공해주세요.
`;

    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 1500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '검토 결과를 생성할 수 없습니다.';
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw error;
    }
  }
}
