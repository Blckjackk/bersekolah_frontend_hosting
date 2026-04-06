# Static Image Guidelines

Folder ini dipakai untuk aset gambar statis yang tidak bergantung database.

## Struktur Folder

- auth/: gambar untuk halaman masuk, daftar, lupa password
- program/: gambar kartu Program Beasiswa, Donasi, Mentoring
- brand/: logo, lockup, dan varian brand resmi
- about/: gambar untuk section Tentang Kami dan partisipasi

## Naming Convention (disarankan)

Format: image*<halaman>*<bagian>\_<deskripsi>.<ext>

Contoh:

- image_login_hero.webp
- image_program_beasiswa_card.webp
- image_program_donasi_card.webp
- image_program_mentoring_card.webp
- image_brand_lockup_primary.svg

## Best Practice

1. Gunakan format .webp untuk foto (lebih ringan), .png/.svg untuk logo.
2. Simpan rasio tetap untuk section yang sama (contoh kartu program 16:9).
3. Ukuran rekomendasi:
   - hero login: 1600x1200
   - card program: 1200x675
4. Optimasi target ukuran file:
   - hero: <= 350 KB
   - card: <= 200 KB
5. Jangan timpa nama file lama. Jika update versi, gunakan suffix v2, v3.

## Mapping Lokasi (awal)

- /masuk hero image -> /assets/image/static/auth/image_login_hero.webp
- / hero "Mari Nyalakan Semangat Pendidikan bersama Kami" -> /assets/image/static/hero/image_home_hero_pendidikan.jpg
- / section "Apa itu Beasiswa Bersekolah?" -> /assets/image/static/about/image_home_about_beasiswa.jpg
- / FAQ image -> /assets/image/static/about/image_home_faq_cover.jpg
- /company-profile/artikel hero -> /assets/image/static/hero/image_company_profile_artikel_hero.jpg
- /company-profile/kontak hero -> /assets/image/static/hero/image_company_profile_kontak_hero.jpg
- /company-profile/donasi hero -> /assets/image/static/hero/image_company_profile_donasi_hero.jpg
- /company-profile/tentang hero -> /assets/image/static/hero/image_company_profile_tentang_hero.jpg
- /company-profile/tentang sejarah image -> /assets/image/static/about/image_company_profile_tentang_sejarah.jpg
- Beranda kartu Program Beasiswa -> /assets/image/static/program/image_program_beasiswa_card.webp
- Beranda kartu Program Donasi -> /assets/image/static/program/image_program_donasi_card.webp
- Beranda kartu Program Mentoring -> /assets/image/static/program/image_program_mentoring_card.webp
