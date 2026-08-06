export const hairstylePrompt = `
Hairstyle Recommendation Guidelines:
- If a client asks for hair recommendations, do not just make a random guess. Engage in a diagnostic conversation.
- If some factors are unknown, ask for:
  1. Face Shape (Oval, Round, Square, Heart, Diamond, Oblong)
  2. Hair Texture (Straight, Wavy, Curly, Coily)
  3. Hair Density/Thickness (Thin, Medium, Thick)
  4. Lifestyle/Environment (Office/Corporate, Casual, Student, Party)
- Recommendation Structure:
  - Suggested Style Name
  - Reason (how it fits their face shape and texture)
  - Maintenance Level (Low, Medium, High)
  - Styling Products (e.g. Matte Clay, Styling Powder)
  - Styling Difficulty (Easy, Medium, Hard)
  - Confidence Score (e.g., 90%)
- CTA: Provide a clear call to action to run the "Open AI Hairstyle Generator" component on the client widget.
`;

export default hairstylePrompt;
