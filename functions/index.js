const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Fungsi ini akan dipanggil dari aplikasi web kita
exports.sendWhatsappNotification = functions.https.onCall(async (data, context) => {
  // Ambil token Fonnte dari konfigurasi aman
  const fonnteToken = functions.config().fonnte.token;

  if (!fonnteToken) {
    throw new functions.https.HttpsError(
      "internal",
      "Token Fonnte tidak diatur di konfigurasi."
    );
  }

  const target = data.to; // Nomor WA tujuan
  const message = data.message; // Isi pesan

  if (!target || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Nomor tujuan (to) dan pesan (message) wajib diisi."
    );
  }

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": fonnteToken, // Menggunakan token di header
      },
      body: JSON.stringify({
        target: target,
        message: message,
      }),
    });

    const result = await response.json();

    // Log hasil dari Fonnte untuk debugging
    console.log("Fonnte API Response:", result);

    return { success: true, result: result };
  } catch (error) {
    console.error("Error mengirim notifikasi via Fonnte:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Gagal menghubungi API Fonnte."
    );
  }
});