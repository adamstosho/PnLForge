/**
 * AI Chat Route - HuggingFace Integration (FREE!)
 * Uses HuggingFace Inference API for text generation
 */

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'
const HF_INFERENCE_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()
    const { messages, context: rawContext } = rawBody

    // Default context to prevent crashes
    const context = {
      totalPnL: rawContext?.totalPnL ?? 0,
      winRate: rawContext?.winRate ?? 0,
      profitFactor: rawContext?.profitFactor ?? 1,
      kRatio: rawContext?.kRatio ?? 0,
      maxDrawdownPct: rawContext?.maxDrawdownPct ?? 0,
      kellyCriterion: rawContext?.kellyCriterion ?? 0,
      sharpeRatio: rawContext?.sharpeRatio ?? 0,
      tradesCount: rawContext?.tradesCount ?? 0,
    }

    if (!HUGGINGFACE_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'HuggingFace API key not configured. Set HUGGINGFACE_API_KEY in .env.local'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are the PnlForge Intelligence Oracle, a professional trading strategist for the Deriverse ecosystem.

User's Performance Context:
- Total PnL: $${context.totalPnL?.toFixed(2)}
- Win Rate: ${(context.winRate * 100).toFixed(1)}%
- Profit Factor: ${context.profitFactor?.toFixed(2)}
- K-Ratio (Consistency): ${context.kRatio?.toFixed(3)}
- Max Drawdown: ${context.maxDrawdownPct?.toFixed(1)}%
- Kelly Criterion: ${(context.kellyCriterion * 100).toFixed(1)}%
- Sharpe Ratio: ${context.sharpeRatio?.toFixed(2)}
- Total Trades: ${context.tradesCount}

Be professional, direct, and data-driven. Use markdown formatting. Keep responses concise.`

    // Build conversation history for HuggingFace
    let conversationText = systemPrompt + '\n\n'
    for (const msg of messages) {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
    }
    conversationText += 'Assistant: '

    // Call HuggingFace Inference API
    const response = await fetch(HF_INFERENCE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: conversationText,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HuggingFace API Error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `HuggingFace API failed: ${response.status}`, details: errorText }),
        { status: response.status === 401 ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = (await response.json()) as any[]
    let assistantResponse = ''

    if (Array.isArray(result) && result[0]?.generated_text) {
      assistantResponse = result[0].generated_text.replace(conversationText, '').trim()
    } else {
      console.error('Unexpected HuggingFace API response format:', result)
      assistantResponse = 'I apologize, but I received an unexpected response from the AI engine.'
    }

    // Return as text stream for compatibility
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(assistantResponse))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('AI Chat Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
