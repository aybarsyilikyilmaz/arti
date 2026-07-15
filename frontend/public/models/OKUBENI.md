# 3D Yemek Modelleri

"Kutudan Ne Çıkacak?" bölümü bu klasörden şu 5 dosyayı yükler:

- `donut.glb`
- `ekmek.glb`
- `kruvasan.glb`
- `ekler.glb`
- `sushi.glb`

Dosya adları birebir böyle olmalı (küçük harf). İçerik istediğin herhangi bir
yemek olabilir — ad sadece hangi sıraya oturacağını belirler. Kod, modeli
otomatik olarak ölçekler ve ortalar; boyut/konum ayarı yapmana gerek yok.

## Gerçekçi model nereden bulunur?

Fotogerçekçi görünüm için **fotogrametri (3D tarama)** modelleri ara:

1. **Sketchfab** (sketchfab.com) — en iyi kaynak.
   - Arama: `bread scan`, `croissant photogrammetry`, `donut scan`, `food scan`
   - Filtreler: **Downloadable** işaretle, License olarak **CC0** veya **CC BY** seç
   - İndirme formatı: **glTF** → zip içinden `.glb` dosyasını (veya
     `scene.gltf` yerine "Autoconverted format (glb)") al
2. **Poly Pizza** (poly.pizza) — ücretsiz ama low-poly/stilize modeller
   (gerçekçi değil, karikatür görünümlü).
3. **Poly Haven** (polyhaven.com/models) — az sayıda ama çok kaliteli
   CC0 taranmış model var.

## Notlar

- Her dosya ideal olarak 10 MB altında olsun (sayfa yükleme hızı için).
- Draco ile sıkıştırılmış glb'ler de çalışır (decoder otomatik yüklenir).
- CC BY lisanslı model kullanırsan sitede model sahibine atıf vermen gerekir.
- Dosya eksikse sayfa bozulmaz; tarayıcı konsoluna uyarı düşer ve o yemek
  görünmez.
