// API settings based on your exact requirement
const API_KEY = "AIzaSyDxDroEBG_jEAdJlHqzEyTj6RLUJWQcxak";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

async function generateRecipe() {
    const ing1 = document.getElementById('ing1').value.trim();
    const ing2 = document.getElementById('ing2').value.trim();
    const ing3 = document.getElementById('ing3').value.trim();

    const errorDiv = document.getElementById('errorMessage');
    const resultContainer = document.getElementById('resultContainer');
    const recipeContent = document.getElementById('recipeContent');
    const loader = document.getElementById('loader');
    const btn = document.getElementById('generateBtn');

    // Reset UI states
    errorDiv.style.display = 'none';
    resultContainer.style.display = 'none';

    if (!ing1 || !ing2 || !ing3) {
        errorDiv.textContent = "Please enter all three ingredients to proceed.";
        errorDiv.style.display = 'block';
        return;
    }

    // Set loading state
    btn.disabled = true;
    btn.textContent = "Generating...";
    loader.style.display = 'block';

    // Carefully crafted prompt to strictly return HTML format
    const prompt = `You are a world-class Michelin star chef. Create a delicious, creative recipe using these exact three main ingredients: ${ing1}, ${ing2}, and ${ing3}. You may assume the user has basic pantry staples like salt, pepper, cooking oil, and water. 
    
    Return the recipe ONLY in pure HTML format. Do NOT wrap it in markdown code blocks like \`\`\`html. Do not include any HTML head or body tags, just the inner content.
    
    Use exactly this structure:
    <h2>[Catchy Recipe Title]</h2>
    <p class="desc">[A short, mouth-watering description of the dish]</p>
    <h3>Ingredients</h3>
    <ul>
        <li>[Ingredient 1 with measurement]</li>
        <li>[Ingredient 2 with measurement]</li>
        <li>[Ingredient 3 with measurement]</li>
    </ul>
    <h3>Instructions</h3>
    <ol>
        <li>[First step]</li>
        <li>[Second step]</li>
    </ol>
    
    Do not include the \`\`\`html string anywhere. Just raw HTML elements.`;

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7, // Balances creativity with structure
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errDetail = await response.text();
            throw new Error(`API Error ${response.status}: ${errDetail}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            let aiHtml = data.candidates[0].content.parts[0].text;
            
            // Sanitize potential markdown blocks returned by LLM
            aiHtml = aiHtml.replace(/```html\s*/gi, '').replace(/```\s*/gi, '');
            
            recipeContent.innerHTML = aiHtml;
            resultContainer.style.display = 'block';
        } else {
            throw new Error("Invalid response format from Gemini API");
        }

    } catch (error) {
        console.error("Error connecting to Gemini API:", error);
        
        // Check if it's specifically a failed to fetch (CORS/Network error)
        if (error.message.includes("Failed to fetch")) {
            errorDiv.innerHTML = `<strong>Network Error:</strong> Your browser has blocked the request (CORS error). <br><br><strong>How to fix:</strong> You cannot run this directly by double-clicking index.html. You must run it through a local server (like using the "Live Server" extension in VS Code).`;
        } else {
            errorDiv.textContent = "Error Details: " + error.message;
        }
        
        errorDiv.style.display = 'block';
    } finally {
        // Restore UI state
        btn.disabled = false;
        btn.textContent = "Generate Magic Recipe";
        loader.style.display = 'none';
    }
}
