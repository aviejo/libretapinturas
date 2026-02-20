const mixService = require('../services/mix.service');
const { generateMixSchema } = require('../schemas/mix.schema');
const paintService = require('../services/paint.service');
const AIService = require('../services/ai/ai.service');
const logger = require('../config/logger');

class MixController {
  async generate(req, res, next) {
    try {
      // Validate input
      const { targetBrand, targetName, targetColor, targetReference, save } = generateMixSchema.parse(req.body);
      
      // Get user ID from auth token
      const userId = req.user.userId;
      
      logger.info({ userId, targetBrand, targetName }, 'Generating paint mix with AI');
      
      // Check if CLI requested auto-save
      const shouldSave = save === true || save === 'true';
      
      let result;
      if (shouldSave) {
        // CLI mode: Generate AND save automatically
        result = await mixService.generateMix(userId, targetBrand, targetName, targetColor, targetReference);
        logger.info({ userId, mixId: result.id, mixName: result.name }, 'Mix generated and saved successfully');
      } else {
        // Frontend mode: Generate preview only (user must confirm)
        result = await mixService.generateMixPreview(userId, targetBrand, targetName, targetColor, targetReference);
        logger.info({ userId, targetBrand, targetName }, 'Mix preview generated successfully');
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        logger.warn({ userId: req.user?.userId, errors: error.errors }, 'Mix generation failed: validation error');
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      
      if (error.message.includes('AI_API_KEY')) {
        logger.error({ userId: req.user?.userId }, 'Mix generation failed: AI service not configured');
        return res.status(500).json({
          success: false,
          error: 'Servicio de IA no configurado'
        });
      }
      
      logger.error({ error: error.message, userId: req.user?.userId }, 'Mix generation failed: unexpected error');
      next(error);
    }
  }

  /**
   * Test AI connection health
   * GET /api/mixes/health
   */
  async health(req, res, next) {
    try {
      // Get AI provider
      const aiProvider = AIService.create();
      
      // Test connection
      const healthStatus = await aiProvider.testConnection();
      
      res.json({
        success: healthStatus.connected,
        data: healthStatus
      });
    } catch (error) {
      if (error.message.includes('AI_API_KEY')) {
        return res.status(503).json({
          success: false,
          error: 'Servicio de IA no configurado',
          data: {
            status: 'not_configured',
            provider: process.env.AI_PROVIDER || 'gemini',
            envApiKeyPreview: process.env.AI_API_KEY ? `${process.env.AI_API_KEY.substring(0, 8)}...` : 'not-set',
            connected: false,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      res.status(503).json({
        success: false,
        error: error.message,
        data: {
          status: 'error',
          provider: process.env.AI_PROVIDER || 'gemini',
          connected: false,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Reset AI provider cache (useful for testing config changes)
   * POST /api/mixes/reset
   */
  async reset(req, res, next) {
    try {
      AIService.reset();
      
      res.json({
        success: true,
        data: {
          message: 'AI provider cache cleared',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Preview the prompt that would be sent to AI (dry-run)
   * GET /api/mixes/preview
   */
  async preview(req, res, next) {
    try {
      const { targetBrand, targetName, targetColor } = req.query;
      
      if (!targetBrand || !targetName) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren targetBrand y targetName'
        });
      }
      
      // Get user ID from auth token
      const userId = req.user.userId;
      
      // Get user's paint palette
      const userPaints = await paintService.getAllByUser(userId);
      
      // Prepare palette for AI
      const palette = userPaints.map(paint => ({
        id: paint.id,
        brand: paint.brand,
        name: paint.name,
        color: paint.color,
        reference: paint.reference,
        isMix: paint.isMix
      }));
      
      // Get AI provider and build prompt
      const aiProvider = AIService.create();
      const prompt = aiProvider.buildPrompt(targetBrand, targetName, palette);
      
      res.json({
        success: true,
        data: {
          targetBrand,
          targetName,
          targetColor: targetColor || null,
          prompt,
          paletteSize: palette.length,
          promptLength: prompt.length,
          provider: aiProvider.constructor.name,
          model: aiProvider.modelName || 'default'
        }
      });
    } catch (error) {
      if (error.message.includes('AI_API_KEY')) {
        return res.status(500).json({
          success: false,
          error: 'Servicio de IA no configurado'
        });
      }
      
      next(error);
    }
  }

  /**
   * Get raw response from AI for debugging
   * POST /api/mixes/raw
   */
  async raw(req, res, next) {
    try {
      // Validate input
      const { targetBrand, targetName, targetColor, targetReference } = generateMixSchema.parse(req.body);
      
      // Get user ID from auth token
      const userId = req.user.userId;
      
      // Get user's paint palette
      const userPaints = await paintService.getAllByUser(userId);
      
      // Prepare palette for AI
      const palette = userPaints.map(paint => ({
        id: paint.id,
        brand: paint.brand,
        name: paint.name,
        color: paint.color,
        reference: paint.reference,
        isMix: paint.isMix
      }));
      
      // Get AI provider
      const aiProvider = AIService.create();
      
      // Build prompt with reference if provided
      let enhancedTargetName = targetName;
      if (targetReference) {
        enhancedTargetName = `${targetName} (Ref: ${targetReference})`;
      }
      const prompt = aiProvider.buildPrompt(targetBrand, enhancedTargetName, palette);
      
      // Call AI and get raw response - Provider-specific handling
      const startTime = Date.now();
      let rawText, providerInfo;
      
      if (aiProvider.constructor.name === 'GeminiProvider') {
        // Gemini uses model.generateContent()
        const result = await aiProvider.model.generateContent(prompt);
        const response = await result.response;
        rawText = response.text();
        providerInfo = { provider: 'gemini', model: aiProvider.modelName };
      } else if (aiProvider.constructor.name === 'LLMStudioProvider') {
        // LLMStudio uses axios REST API
        const axios = require('axios');
        const response = await axios.post(
          `${aiProvider.baseUrl}/v1/chat/completions`,
          {
            model: aiProvider.modelName,
            messages: [
              {
                role: 'system',
                content: 'You are a paint mixing expert for model painting and miniatures. Respond ONLY with valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 2048,
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${aiProvider.apiKey}`
            },
            timeout: 120000
          }
        );
        rawText = response.data.choices[0].message.content;
        providerInfo = { provider: 'llmstudio', model: aiProvider.modelName, baseUrl: aiProvider.baseUrl };
      } else {
        throw new Error(`Unknown provider: ${aiProvider.constructor.name}`);
      }
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          targetBrand,
          targetName,
          targetReference: targetReference || null,
          targetColor: targetColor || null,
          prompt,
          rawResponse: rawText,
          responseTime: `${responseTime}ms`,
          promptLength: prompt.length,
          responseLength: rawText.length,
          paletteSize: palette.length,
          ...providerInfo,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      
      if (error.message.includes('AI_API_KEY')) {
        return res.status(500).json({
          success: false,
          error: 'Servicio de IA no configurado'
        });
      }
      
      // Return error details for debugging
      res.status(500).json({
        success: false,
        error: error.message,
        data: {
          errorType: error.constructor.name,
          errorStack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

module.exports = new MixController();
