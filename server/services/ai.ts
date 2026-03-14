import fetch from 'node-fetch';
import type { Property } from '../../src/types.js';

interface AnalysisResult {
  aiPredictedPrice: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  investmentRating: number;
  recommendations: string[];
  marketAnalysis: string;
  loanAnalysis: string;
}

// Get MiniMax API configuration
function getMiniMaxConfig(): { apiKey: string; model: string } | null {
  const apiKey = process.env.MINIMAX_API_KEY;
  const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.5';
  
  if (!apiKey || apiKey === 'your-minimax-api-key') {
    console.warn('⚠️ MINIMAX_API_KEY not set, using fallback analysis');
    return null;
  }
  
  return { apiKey, model };
}

// Call MiniMax API
async function callMiniMax(prompt: string): Promise<string> {
  const config = getMiniMaxConfig();
  if (!config) {
    throw new Error('MiniMax not configured');
  }

  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: '你是一个专业的房产投资分析师，擅长分析法拍房的风险和投资价值。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.status}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '';
}

// Fallback analysis when no API key
function fallbackAnalysis(property: any): AnalysisResult {
  const discount = (property.evaluation_price - property.starting_price) / property.evaluation_price;
  const profitPotential = ((property.evaluation_price - property.starting_price) / property.starting_price) * 100;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  // Risk assessment
  if (discount > 0.3) {
    riskLevel = 'low';
    riskFactors.push('起拍价低于评估价30%以上，安全边际较高');
  } else if (discount > 0.2) {
    riskLevel = 'medium';
    riskFactors.push('折扣适中，需要进一步尽调');
  } else {
    riskFactors.push('折扣较小，竞价可能激烈');
  }
  
  if (property.usage_type?.includes('住宅')) {
    recommendations.push('建议实地查看房屋现状');
    recommendations.push('核实是否存在长期租赁');
  }
  
  recommendations.push('建议核实产权是否清晰');
  recommendations.push('建议实地考察周边配套设施');
  
  const investmentRating = riskLevel === 'low' ? 4.5 : riskLevel === 'medium' ? 3.5 : 2.5;
  
  return {
    aiPredictedPrice: Math.round(property.evaluation_price * (1 - discount * 0.3)),
    riskLevel,
    riskFactors,
    investmentRating,
    recommendations,
    marketAnalysis: `该房产位于${property.location}，评估价${(property.evaluation_price / 10000).toFixed(0)}万元，起拍价${(property.starting_price / 10000).toFixed(0)}万元，${discount > 0.2 ? '具有一定' : '折扣'}空间。`,
    loanAnalysis: `最高可贷款${((property.loan_max_loan || property.starting_price * 0.7) / 10000).toFixed(0)}万元，月供约${((property.loan_monthly_payment || 20000) / 1000).toFixed(0)}千元。`
  };
}

// Main AI analysis function
export async function analyzeProperty(property: any): Promise<AnalysisResult> {
  const config = getMiniMaxConfig();
  
  if (!config) {
    return fallbackAnalysis(property);
  }
  
  try {
    const prompt = `
请分析以下司法拍卖房产并给出投资建议：

房产信息：
- 名称：${property.title}
- 位置：${property.location}
- 面积：${property.area}平方米
- 楼层：${property.floor}
- 用途：${property.usage_type}
- 评估价：${(property.evaluation_price / 10000).toFixed(0)}万元
- 起拍价：${(property.starting_price / 10000).toFixed(0)}万元
- 建筑年代：${property.built_date}
- 拍卖法院：${property.court}
- 案件编号：${property.case_number}

请以JSON格式返回以下分析结果：
{
  "aiPredictedPrice": 预测成交价（数字，单位元）,
  "riskLevel": "low" | "medium" | "high",
  "riskFactors": ["风险因素1", "风险因素2"],
  "investmentRating": 1-5的评分,
  "recommendations": ["建议1", "建议2"],
  "marketAnalysis": "市场分析简短描述",
  "loanAnalysis": "贷款分析简短描述"
}
    `;
    
    const response = await callMiniMax(prompt);
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        aiPredictedPrice: Number(parsed.aiPredictedPrice),
        riskLevel: parsed.riskLevel || 'medium',
        riskFactors: parsed.riskFactors || [],
        investmentRating: Number(parsed.investmentRating) || 3,
        recommendations: parsed.recommendations || [],
        marketAnalysis: parsed.marketAnalysis || '',
        loanAnalysis: parsed.loanAnalysis || ''
      };
    }
    
    return fallbackAnalysis(property);
  } catch (error) {
    console.error('AI analysis error:', error);
    return fallbackAnalysis(property);
  }
}

// Generate AI summary for property
export async function generatePropertySummary(property: any): Promise<string> {
  const config = getMiniMaxConfig();
  
  if (!config) {
    return `${property.title}位于${property.location}，建筑面积${property.area}平方米。评估价${(property.evaluation_price / 10000).toFixed(0)}万元，起拍价${(property.starting_price / 10000).toFixed(0)}万元。`;
  }
  
  try {
    const prompt = `
请用50字以内描述以下房产的核心亮点：

${property.title}
位置：${property.location}
面积：${property.area}㎡
评估价：${(property.evaluation_price / 10000).toFixed(0)}万元
起拍价：${(property.starting_price / 10000).toFixed(0)}万元
    `;
    
    const response = await callMiniMax(prompt);
    return response.trim();
  } catch (error) {
    console.error('Summary generation error:', error);
    return `${property.title}位于${property.location}，性价比较高。`;
  }
}
