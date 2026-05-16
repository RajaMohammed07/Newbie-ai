const API_KEY = "AIzaSyAQv0YJ9PR5WFS2KvXLvzElQXzLFoLxDUk";

const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", generateRecipe);

document.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {
        generateRecipe();
    }
});

async function generateRecipe() {

    const ing1 = document.getElementById("ing1").value.trim();

    const ing2 = document.getElementById("ing2").value.trim();

    const ing3 = document.getElementById("ing3").value.trim();

    const errorDiv = document.getElementById("errorMessage");

    const loader = document.getElementById("loader");

    const resultContainer = document.getElementById("resultContainer");

    const recipeContent = document.getElementById("recipeContent");

    errorDiv.style.display = "none";

    resultContainer.style.display = "none";

    if (!ing1 || !ing2 || !ing3) {

        errorDiv.textContent =
            "Please enter all three ingredients.";

        errorDiv.style.display = "block";

        return;
    }

    generateBtn.disabled = true;

    generateBtn.textContent = "Generating...";

    loader.style.display = "block";

    const prompt = `
Create a delicious recipe using these ingredients:
${ing1}, ${ing2}, ${ing3}

Return ONLY clean HTML.

Structure:

<h2>Recipe Name</h2>

<p class="desc">
Short tasty description
</p>

<h3>Ingredients</h3>

<ul>
<li>Ingredient</li>
</ul>

<h3>Instructions</h3>

<ol>
<li>Step</li>
</ol>

No markdown.
No code blocks.
`;

    const payload = {

        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],

        generationConfig: {
            temperature: 0.7
        }
    };

    try {

        const response = await fetch(
            `${API_URL}?key=${API_KEY}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                `API Error ${response.status}: ${errorText}`
            );
        }

        const data = await response.json();

        const aiResponse =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error("Invalid AI response.");
        }

        const cleanHtml = aiResponse
            .replace(/```html/gi, "")
            .replace(/```/g, "");

        recipeContent.innerHTML =
            DOMPurify.sanitize(cleanHtml);

        resultContainer.style.display = "block";

    } catch (error) {

        console.error(error);

        errorDiv.textContent = error.message;

        errorDiv.style.display = "block";

    } finally {

        loader.style.display = "none";

        generateBtn.disabled = false;

        generateBtn.textContent = "Generate Recipe";
    }
}
