# MDT Overlay (plugin `.asi` untuk FiveM)

Plugin klien-saja untuk FiveM: merender portal MDT (`rsrx.web.id/masuk`) sebagai
panel di dalam game — gaya ENB / ReShade / QuantV. **Nol kode server.**

## Install

1. Buka folder `plugins` FiveM:
   `D:\Fivem\IDP - Copy\FiveM.app\plugins\`
2. Copy **`mdt-overlay.asi`** ke sana.
3. Jalankan FiveM -> masuk server -> tekan **F7**.

File pendukung (opsional, dibuat otomatis kalau belum ada):
- `mdt-overlay.ini` — **cuma binding tombol**
- `mdt-overlay-settings.ini` — setting lain (label tombol situs, bingkai, dll)
- `mdt-overlay-ui.js` — UI ⚙ SETTING di dalam panel

## Tombol

| Tombol | Fungsi |
|---|---|
| `F7` | buka / tutup panel MDT (otomatis kirim `/e tablet`) |
| `F10` | Clock In / Clock Out (satu tombol) |
| `F9` | On Call (AFK) |
| `ESC` | tutup panel / batalin ubah binding |

> `F8` dipakai console FiveM, tidak disentuh plugin.
> Binding bisa diganti dari **⚙ SETTING** di pojok kanan-bawah panel.

## Auto update

Plugin cek `version.txt` di repo ini tiap start. Kalau versinya lebih baru,
file diunduh & dipasang (berlaku setelah FiveM restart).

Isi `updateUrl` di `mdt-overlay-settings.ini`:
```
updateUrl=https://raw.githubusercontent.com/zcus0/mdt-overlay/main
```

Isi repo (branch `main`):
- `version.txt` — nomor versi, mis. `1.1.0`
- `mdt-overlay.asi`
- `mdt-overlay-ui.js`

## Uninstall

Hapus `mdt-overlay.asi` dari folder `plugins/`, restart FiveM.

## Catatan

- Tidak patch memory, tidak hook renderer — cuma window WebView2 di atas game.
- Login dilakukan di situs `rsrx.web.id`; cookie tersimpan di `mdt-overlay-profile/`.
