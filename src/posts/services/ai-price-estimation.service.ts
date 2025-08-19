import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InferenceClient } from '@huggingface/inference';
import { EstimatePriceDto } from '../dto/estimate-price.dto';
import { SuggestFieldDto } from '../dto/suggest-field.dto';

@Injectable()
export class AiPriceEstimationService {
  private hf: InferenceClient | null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    if (!apiKey) {
      console.warn('HUGGINGFACE_API_KEY not found, using fallback pricing only');
      this.hf = null;
    } else {
      this.hf = new InferenceClient(apiKey);
    }
  }

  async estimatePrice(data: EstimatePriceDto): Promise<number> {
    console.log('Starting price estimation for:', data.title);
    
    // Check if HF is available and properly configured
    if (!this.hf) {
      throw new Error('Hugging Face API key not configured');
    }

    console.log('Using Qwen2.5-VL for image analysis and price estimation...');
    
    // Convert base64 to buffer and then to blob
    const imageBuffer = this.base64ToBuffer(data.mainPhotoBase64);
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    // Create a comprehensive prompt for price estimation
    const conditionMapping = {
      'NEW': 'brand new',
      'LIKE_NEW': 'like new',
      'USED': 'used',
      'DAMAGED': 'damaged',
      'EXPIRED': 'expired'
    };

    const quantityText = data.quantity 
      ? `${data.quantity.value} ${data.quantity.unit}` 
      : 'quantity not specified';

    const prompt = `You are an expert in evaluating second-hand and surplus items for a marketplace in Tunisia. 

Analyze this image and provide a fair price estimate in Tunisian Dinars (TND) for the items shown.

Item Information:
- Title: ${data.title}
- Description: ${data.description || 'No description provided'}
- Quantity: ${quantityText}
- Condition: ${conditionMapping[data.condition] || data.condition}

Instructions:
1. Carefully examine the image to identify what items are shown
2. Count or estimate the quantity if multiple items are visible
3. Assess the material, size, and quality from the image
4. Consider this is for a second-hand/surplus marketplace in Tunisia with local pricing
5. Factor in the stated condition and Tunisian market conditions
6. Provide a realistic price that would be attractive for Tunisian buyers while fair to sellers
7. Make sure it ends with the realistic price in the format of "PRICE: X.XX"

Response format:
First provide a very brief analysis of what you see and how you determined the price, then end with "PRICE: X.XX" where X.XX is the price in Tunisian Dinars.

Example:
I can see approximately 15-20 wooden planks of various sizes stacked together. The wood appears to be construction lumber, mostly pine or similar softwood. Some pieces show wear and weathering consistent with "used" condition. For a bulk lot of construction wood in used condition, considering the quantity and Tunisian marketplace pricing: PRICE: 75.00`;

    // Use the Qwen2.5-VL model for vision-language understanding
    const response = await this.hf.chatCompletion({
      model: 'Qwen/Qwen2.5-VL-7B-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: data.mainPhotoBase64
              }
            }
          ]
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    console.log('Qwen2.5-VL response:', response);

    if (response?.choices?.[0]?.message?.content) {
      const fullResponse = response.choices[0].message.content.trim();
      console.log('\n=== AI ANALYSIS ===');
      console.log(fullResponse);
      console.log('==================\n');
      
      // Extract price from "PRICE: X.XX" format
      const priceMatch = fullResponse.match(/PRICE:\s*(\d+\.?\d*)/i);
      
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        if (!isNaN(price) && price > 0) {
          console.log(`Qwen2.5-VL estimated price: DT${price}`);
          return Math.round(price * 100) / 100;
        }
      }
      
      // Fallback: try to find any number in the response
      const fallbackMatch = fullResponse.match(/(\d+\.?\d*)/);
      if (fallbackMatch) {
        const price = parseFloat(fallbackMatch[1]);
        if (!isNaN(price) && price > 0 && price < 1000) { // reasonable price range
          console.log(`Qwen2.5-VL estimated price (fallback parsing): DT${price}`);
          return Math.round(price * 100) / 100;
        }
      }
    }

    throw new Error('Failed to get valid price from Qwen2.5-VL model');
  }

  async suggestField(data: SuggestFieldDto): Promise<string> {
    console.log(`Starting ${data.fieldType} suggestion for image`);
    
    // Check if HF is available and properly configured
    if (!this.hf) {
      throw new Error('Hugging Face API key not configured');
    }

    console.log('Using Qwen2.5-VL for field suggestion...');
    
    // Convert base64 to buffer and then to blob
    const imageBuffer = this.base64ToBuffer(data.mainPhotoBase64);
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    const conditionMapping = {
      'NEW': 'brand new',
      'LIKE_NEW': 'like new',
      'USED': 'used',
      'DAMAGED': 'damaged',
      'EXPIRED': 'expired'
    };

    let prompt = '';
    
    switch (data.fieldType) {
      case 'title':
        prompt = `You are an expert in creating clear, concise titles for a second-hand marketplace.

Analyze this image and create a short, descriptive title in French for what you see.

Item Information:
- Condition: ${data.condition ? conditionMapping[data.condition] || data.condition : 'not specified'}

Instructions:
1. Identify the main items in the image
2. Create a clear, marketable title in French
3. Keep it concise (3-8 words)
4. Focus on what would help buyers find this item
5. Don't include condition or price
6. Don't use quotes or quotation marks

Examples:
- Lot de vaisselle vintage
- Planches en bois recyclé
- Vêtements enfant taille 6 ans

Response format: Only provide the title without quotes or quotation marks.`;
        break;

      case 'description':
        prompt = `Write a simple, natural product description in French like a regular person would.

Look at this image and describe what's for sale.

Item Information:
- Title: ${data.existingTitle || 'not provided'}
- Condition: ${data.condition ? conditionMapping[data.condition] || data.condition : 'not specified'}

Instructions:
1. Write like you're telling a friend what you're selling
2. Keep it simple and direct - no fancy words
3. Mention key details: colors, materials, size/quantity
4. Be honest about condition if you notice issues
5. 1-3 short sentences maximum
6. Don't start with "Cette image montre" or similar phrases
7. Use everyday French, not formal language

Examples of good descriptions:
- Lot de vêtements femme en bon état, tailles variées. Principalement du coton, couleurs et motifs divers.
- Planches de bois récupérées, quelques traces d'usure mais solides. Parfait pour bricolage.
- Vaisselle dépareillée mais complète, quelques petits éclats sur les assiettes.

Response format: Only the description, nothing else.`;
        break;

      case 'quantity':
        prompt = `You are an expert in estimating quantities for marketplace listings.

Analyze this image and estimate the quantity and appropriate unit.

Item Information:
- Title: ${data.existingTitle || 'not provided'}
- Description: ${data.existingDescription || 'not provided'}

Instructions:
1. Count or estimate the number of items visible
2. Choose the most appropriate unit (kg, L, pièce(s), paquet(s), boîte(s), m², etc.)
3. Be realistic and conservative in your estimate
4. Consider what makes sense for this type of item

Response format: Provide only the number and unit (e.g., "5 pièce(s)" or "2.5 kg"), nothing else.`;
        break;
    }

    // Use the Qwen2.5-VL model for vision-language understanding
    const response = await this.hf.chatCompletion({
      model: 'Qwen/Qwen2.5-VL-7B-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: data.mainPhotoBase64
              }
            }
          ]
        }
      ],
      max_tokens: data.fieldType === 'description' ? 200 : 50,
      temperature: 0.7
    });

    console.log(`Qwen2.5-VL ${data.fieldType} response:`, response);

    if (response?.choices?.[0]?.message?.content) {
      let suggestion = response.choices[0].message.content.trim();
      
      // Remove quotes from title suggestions
      if (data.fieldType === 'title') {
        suggestion = suggestion.replace(/^["']|["']$/g, '');
      }
      
      console.log(`\n=== AI ${data.fieldType.toUpperCase()} SUGGESTION ===`);
      console.log(suggestion);
      console.log('==================\n');
      
      return suggestion;
    }

    throw new Error(`Failed to get valid ${data.fieldType} suggestion from Qwen2.5-VL model`);
  }




  private base64ToBuffer(base64String: string): Buffer {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

}