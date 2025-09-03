import OpenAI from 'openai';

// Initialize the OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OpenAI API key. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
});

/**
 * Analyzes an image for insurance claim purposes
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeImage = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert insurance claim assessor with deep knowledge of property and vehicle damage assessment. Analyze the provided image and identify damage types, object category, and scene context. Provide a detailed, accurate assessment that would be valuable for insurance claim processing."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image for an insurance claim. Identify: 1) Type of damage present 2) Object category (vehicle, property, personal item) 3) Scene context (indoor, outdoor, weather conditions) 4) Any other relevant details for insurance assessment" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 500,
    });

    // Process the response to extract structured data
    const analysisText = response.choices[0].message.content;
    
    // Parse the analysis text to extract structured data
    const damageTypes = extractDamageTypes(analysisText);
    const objectCategory = extractObjectCategory(analysisText);
    const sceneContext = extractSceneContext(analysisText);
    
    // Calculate confidence based on the specificity and detail of the response
    const confidence = calculateConfidence(analysisText, damageTypes, objectCategory, sceneContext);
    
    return {
      detectedDamageTypes: damageTypes,
      objectCategory,
      sceneContext,
      analysisResults: {
        confidence,
        rawAnalysis: analysisText,
      },
      success: true
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze image'
    };
  }
};

/**
 * Extract damage types from analysis text
 */
const extractDamageTypes = (text) => {
  // Common damage types to look for
  const damageKeywords = [
    'dent', 'scratch', 'crack', 'water damage', 'fire damage', 
    'smoke damage', 'hail damage', 'impact damage', 'structural damage',
    'collision damage', 'vandalism', 'broken', 'shattered', 'bent',
    'crushed', 'torn', 'flood damage', 'wind damage', 'burn'
  ];
  
  const foundDamageTypes = [];
  
  // Look for damage types in the text
  damageKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      // Capitalize first letter of each word
      const formattedType = keyword.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      foundDamageTypes.push(formattedType);
    }
  });
  
  // If no damage types were found, return a generic "Unknown Damage" type
  return foundDamageTypes.length > 0 ? foundDamageTypes : ['Unknown Damage'];
};

/**
 * Extract object category from analysis text
 */
const extractObjectCategory = (text) => {
  const text_lower = text.toLowerCase();
  
  if (text_lower.includes('vehicle') || 
      text_lower.includes('car') || 
      text_lower.includes('truck') || 
      text_lower.includes('motorcycle') ||
      text_lower.includes('auto')) {
    return 'Vehicle';
  }
  
  if (text_lower.includes('house') || 
      text_lower.includes('building') || 
      text_lower.includes('property') || 
      text_lower.includes('home') ||
      text_lower.includes('structure') ||
      text_lower.includes('roof') ||
      text_lower.includes('wall')) {
    return 'Property';
  }
  
  if (text_lower.includes('item') || 
      text_lower.includes('personal') || 
      text_lower.includes('belonging') || 
      text_lower.includes('possession') ||
      text_lower.includes('furniture') ||
      text_lower.includes('electronic')) {
    return 'Personal Item';
  }
  
  return 'Other';
};

/**
 * Extract scene context from analysis text
 */
const extractSceneContext = (text) => {
  const text_lower = text.toLowerCase();
  
  // Determine indoor/outdoor
  let location = 'Unknown';
  if (text_lower.includes('indoor') || 
      text_lower.includes('inside') || 
      text_lower.includes('interior') ||
      text_lower.includes('room')) {
    location = 'Indoor';
  } else if (text_lower.includes('outdoor') || 
             text_lower.includes('outside') || 
             text_lower.includes('exterior')) {
    location = 'Outdoor';
  }
  
  // Check for weather conditions
  const weatherConditions = [
    'rain', 'snow', 'hail', 'storm', 'sunny', 'cloudy', 
    'windy', 'fog', 'ice', 'flood', 'hurricane', 'tornado'
  ];
  
  let weather = '';
  for (const condition of weatherConditions) {
    if (text_lower.includes(condition)) {
      weather = condition.charAt(0).toUpperCase() + condition.slice(1);
      break;
    }
  }
  
  return weather ? `${location} (${weather})` : location;
};

/**
 * Calculate confidence score based on analysis completeness
 */
const calculateConfidence = (text, damageTypes, objectCategory, sceneContext) => {
  let score = 0.5; // Base confidence
  
  // Add confidence based on damage types identified
  if (damageTypes.length > 0 && !damageTypes.includes('Unknown Damage')) {
    score += 0.2;
  }
  
  // Add confidence based on object category
  if (objectCategory !== 'Other') {
    score += 0.15;
  }
  
  // Add confidence based on scene context
  if (sceneContext !== 'Unknown') {
    score += 0.15;
  }
  
  // Add confidence based on text length (more detailed analysis)
  if (text.length > 200) {
    score += 0.1;
  }
  
  // Cap at 0.98 since we can never be 100% certain
  return Math.min(score, 0.98);
};

