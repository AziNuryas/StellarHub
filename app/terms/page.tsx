import React from 'react'

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '100px auto', padding: 20, color: '#f8fafc', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 20 }}>Syarat dan Ketentuan</h1>
      <p style={{ color: '#94a3b8' }}>Terakhir diperbarui: 11 Mei 2026</p>
      
      <section style={{ marginTop: 40 }}>
        <h2>1. Penerimaan Ketentuan</h2>
        <p>Dengan mengakses StellarHub, Anda setuju untuk terikat oleh syarat dan ketentuan ini serta mematuhi semua hukum dan peraturan yang berlaku.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>2. Penggunaan Konten NASA</h2>
        <p>StellarHub menampilkan konten dari NASA API. Penggunaan konten tersebut tunduk pada panduan publik NASA. Kami tidak memiliki hak cipta atas materi NASA yang ditampilkan.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>3. Perilaku Pengguna</h2>
        <p>Anda setuju untuk tidak mengunggah konten yang melanggar hukum, kasar, atau mengganggu komunitas astronomi kami.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>4. Batasan Tanggung Jawab</h2>
        <p>StellarHub disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform ini.</p>
      </section>
    </div>
  )
}
