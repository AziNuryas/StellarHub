import React from 'react'

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '100px auto', padding: 20, color: '#f8fafc', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 20 }}>Kebijakan Privasi</h1>
      <p style={{ color: '#94a3b8' }}>Terakhir diperbarui: 11 Mei 2026</p>
      
      <section style={{ marginTop: 40 }}>
        <h2>1. Informasi yang Kami Kumpulkan</h2>
        <p>Kami mengumpulkan informasi minimal untuk fungsionalitas akun, termasuk alamat email dan nama pengguna saat Anda mendaftar melalui email atau penyedia pihak ketiga (Google/GitHub).</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>2. Penggunaan Data</h2>
        <p>Data Anda digunakan semata-mata untuk mengelola akun Anda, mengirimkan notifikasi interaksi komunitas, dan meningkatkan pengalaman pengguna di StellarHub.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>3. Keamanan</h2>
        <p>Kami menggunakan enkripsi standar industri dan layanan Supabase yang aman untuk melindungi data pribadi Anda dari akses yang tidak sah.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>4. Perubahan Kebijakan</h2>
        <p>Kami dapat memperbarui kebijakan ini sesekali. Perubahan akan diinformasikan melalui dashboard aplikasi.</p>
      </section>
    </div>
  )
}
