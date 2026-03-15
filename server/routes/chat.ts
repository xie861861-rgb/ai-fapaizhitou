import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';

const router = Router();

// Helper to get user ID from token
function getUserId(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const user = dbGet('SELECT user_id FROM user_tokens WHERE token = ?', [token]);
  
  return user?.user_id || null;
}

// Chat messages table is created on first use
function ensureChatTable() {
  try {
    dbRun(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // Table might already exist
  }
}

// Send a chat message and get AI response
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { message, propertyId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    
    ensureChatTable();
    
    // Save user message
    if (userId) {
      dbRun('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', 
        [userId, 'user', message]);
    }
    
    // Get property info if provided
    let propertyInfo = '';
    if (propertyId) {
      const property = dbGet('SELECT * FROM properties WHERE id = ?', [propertyId]);
      if (property) {
        propertyInfo = `
房产信息：
- 名称：${property.title}
- 位置：${property.location}
- 面积：${property.area}平方米
- 评估价：${(property.evaluation_price / 10000).toFixed(0)}万元
- 起拍价：${(property.starting_price / 10000).toFixed(0)}万元
- 风险等级：${property.risk_level}
- 法拍难度：${property.difficulty_rating}星
        `.trim();
      }
    }
    
    // Get recent chat history
    let history: any[] = [];
    if (userId) {
      history = dbAll(`
        SELECT role, content FROM chat_messages 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 10
      `, [userId]);
      history = history.reverse();
    }
    
    // Build context for AI
    const systemPrompt = `你是一个专业的法拍房AI助手，擅长回答用户关于司法拍卖房产的问题。
${propertyInfo ? `当前讨论的房产：\n${propertyInfo}\n` : ''}
请用专业、友好的语气回答用户的问题。如果用户问的是关于特定房产的问题，给出具体的分析和建议。`.trim();
    
    // Generate response based on question type
    let response = '';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('风险') || lowerMessage.includes('risk')) {
      if (propertyInfo) {
        response = '根据该房源的情况，我为您分析如下：\n\n1. 法律风险：需核实产权是否清晰，是否存在查封、抵押等问题\n2. 租赁风险：需实地查看是否存在长期租赁\n3. 欠费风险：包括物业费、水电费等\n\n建议在参拍前实地看样并调取完整卷宗。';
      } else {
        response = '法拍房的风险主要包括以下几个方面：\n\n1. **法律风险**：产权纠纷、查封状态、抵押情况\n2. **租赁风险**：存在长期租约可能影响交付\n3. **欠费风险**：物业费、水电费等潜在欠费\n4. **竞价风险**：热门房源可能溢价较高\n\n您可以告诉我具体想了解哪套房源的风险情况，我可以给出更详细的分析。';
      }
    } else if (lowerMessage.includes('贷款') || lowerMessage.includes('loan')) {
      response = '法拍房贷款说明：\n\n1. **贷款要求**：需在竞拍前获得银行预审批\n2. **首付比例**：一般为评估价的30%-40%\n3. **贷款额度**：根据银行评估，一般可贷评估价的60%-70%\n4. **放款时间**：法院要求时间内完成付款\n\n建议提前准备首付款项，确保贷款审批通过后再参与竞拍。';
    } else if (lowerMessage.includes('利润') || lowerMessage.includes('收益') || lowerMessage.includes('投资')) {
      response = '法拍房投资收益分析：\n\n1. **折扣空间**：通常比市场价低10%-30%\n2. **持有成本**：税费、物业费、维修费等\n3. **变现周期**：根据市场行情和定价策略\n4. **风险溢价**：价格越低，风险相对越高\n\n建议综合考虑位置、户型、市场需求等因素，做好尽职调查。';
    } else if (lowerMessage.includes('流程') || lowerMessage.includes('怎么买')) {
      response = '法拍房购买流程：\n\n1. **了解规则**：阅读拍卖公告、竞买须知\n2. **实地看样**：实地查看房屋现状\n3. **准备资金**：确定预算，准备首付款\n4. **参与竞拍**：在拍卖平台出价\n5. **签订合同**：竞拍成功后与法院/债权人签订\n6. **办理过户**：完成产权过户手续\n\n每个环节都有需要注意的细节，您可以随时问我具体问题。';
    } else if (lowerMessage.includes('你好') || lowerMessage.includes('您好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      response = '您好！我是AI法拍智投的智能助手，专门为您提供法拍房相关的咨询服务。\n\n我可以帮您：\n- 分析特定房源的风险和投资价值\n- 解答法拍房购买流程问题\n- 提供贷款和税费方面的建议\n\n请问有什么可以帮到您的？';
    } else {
      response = `感谢您的提问！关于"${message}"，我的建议是：

法拍房投资需要做好充分的市场调研和风险评估。建议您：
1. 详细阅读拍卖公告和竞买须知
2. 实地看样了解房屋现状
3. 调查产权情况和潜在风险
4. 计算好投资回报率

如果您有特定想了解的房源，可以告诉我具体信息，我可以给出更精准的分析。`;
    }
    
    // Save assistant response
    if (userId) {
      dbRun('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', 
        [userId, 'assistant', response]);
    }
    
    res.json({ 
      success: true, 
      data: { 
        role: 'assistant', 
        content: response,
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ success: false, error: 'Chat failed' });
  }
});

// Get chat history
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    
    ensureChatTable();
    
    const messages = dbAll(`
      SELECT id, role, content, created_at 
      FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [userId]);
    
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

// Clear chat history
router.delete('/history', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    
    dbRun('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ success: false, error: 'Failed to clear history' });
  }
});

export default router;
