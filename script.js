const GEMINI_API_KEY = "AIzaSyCY41MPlltCgcmBAEM-2_rJWMYL3LCBqZk";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById("userInput");

async function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

userInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && userInput.value.trim()) {
    const question = userInput.value;
    userInput.value = "";
    appendMessage(question, "user");

    // Langkah 1: Minta Gemini tentukan kunci JSON yang relevan
    const step1Prompt = `
Kamu hanya mengembalikan nama kunci JSON yang relevan berdasarkan pertanyaan pengguna.
Data yang tersedia: dataTotalMurid, dataPerKelas, dataGuru.
Pertanyaan: "${question}"
Hanya balas dengan nama kunci JSON, tanpa penjelasan.
    `;

    const step1Result = await askGemini(step1Prompt);
    const jsonKey = step1Result.trim().replace(/[^a-zA-Z0-9]/g, "");

    // Langkah 2: Ambil data dari JSON
    const data = await fetch("data.json").then(r => r.json());
    const jsonData = data[jsonKey];

    // Langkah 3: Kirim ulang ke Gemini untuk jawaban akhir
    const step2Prompt = `
Jawab pertanyaan pengguna secara ringkas dan informatif berdasarkan data berikut:
Pertanyaan: "${question}"
Data: ${JSON.stringify(jsonData, null, 2)}
    `;

    const finalAnswer = await askGemini(step2Prompt);
    appendMessage(finalAnswer, "bot");
  }
});

async function askGemini(prompt) {
  const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa memproses pertanyaan.";
}
