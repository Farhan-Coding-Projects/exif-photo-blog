# Camera and Lens Reference

Reference notes supplied for normalizing camera and lens metadata. The site
uses concise lens labels; the detailed hardware specifications below are kept
for identification and future metadata work.

## Site labels

| Camera | Hardware | Site lens label |
| --- | --- | --- |
| Samsung Galaxy S22 Ultra | 6.4mm / 23mm-equivalent wide camera | `S22 Wide` |
| Samsung Galaxy S22 Ultra | 2.2mm / 13mm-equivalent ultrawide camera | `S22 Ultrawide` |
| Samsung Galaxy S22 Ultra | 69mm-equivalent telephoto camera | `S22 Telephoto` |
| Samsung Galaxy S22 Ultra | 230mm-equivalent periscope camera | `S22 Telephoto` |
| Samsung Galaxy S22 Ultra | 26mm-equivalent front camera | `S22 Front Camera` |
| Samsung Galaxy S25 Ultra | 6.3mm / 23mm-equivalent wide camera | `S25 Main` |
| Samsung Galaxy S25 Ultra | 2.2mm / 13mm-equivalent ultrawide camera | `S25 Ultrawide` |
| Samsung Galaxy S25 Ultra | 67mm-equivalent telephoto camera | `S25 Telephoto` |
| Samsung Galaxy S25 Ultra | 18.6mm / 111–115mm-equivalent periscope camera | `S25 Telephoto` |
| Samsung Galaxy S25 Ultra | 26mm-equivalent front camera | `S25 Front Camera` |
| DJI Mini 4K | 4.49mm / 24mm-equivalent fixed lens | `DJI Main Camera` |

Only assign a label when the photo's EXIF data identifies the hardware with
reasonable confidence. Leave the lens unlabeled when the necessary EXIF fields
are absent.

The naming convention uses compact, camera-specific labels such as `S22 Wide`,
`S25 Ultrawide`, and `DJI Main Camera`. Detailed physical and 35mm-equivalent
focal lengths remain in this reference instead of appearing in site labels.

## Samsung Galaxy S22 Ultra

The Galaxy S22 Ultra has a quad-camera system on the rear and a laser autofocus
module.

- **Main (wide):** 108 MP, f/1.8, 23mm-equivalent focal length, 1/1.33-inch
  sensor, 0.8 µm pixels, 9-in-1 pixel binning to 12 MP, OIS, PDAF, and laser
  autofocus.
- **Ultrawide:** 12 MP, f/2.2, 13mm-equivalent focal length, 120° field of
  view, 1/2.55-inch sensor, 1.4 µm pixels, Dual Pixel PDAF, and Super Steady
  video support.
- **3× telephoto:** 10 MP, f/2.4, 69mm-equivalent focal length, 1/3.52-inch
  sensor, 1.12 µm pixels, OIS, and Dual Pixel PDAF.
- **10× periscope telephoto:** 10 MP, f/4.9, 230mm-equivalent focal length,
  1/3.52-inch sensor, 1.12 µm pixels, OIS, and Dual Pixel PDAF. Supports up to
  100× Space Zoom.
- **Front (selfie):** 40 MP, f/2.2, 26mm-equivalent focal length, 1/2.82-inch
  sensor, 0.7 µm pixels, and PDAF.

## Samsung Galaxy S25 Ultra

The Galaxy S25 Ultra updates the ultrawide and secondary telephoto hardware
while retaining a quad-camera system.

- **Main (wide):** 200 MP, f/1.7, 23mm-equivalent focal length, 1/1.3-inch
  sensor, 0.6 µm pixels, 16-in-1 pixel binning to 12.5 MP, multi-directional
  PDAF, laser autofocus, and OIS.
- **Ultrawide:** 50 MP, f/1.9 or f/2.0, 13mm-equivalent focal length, 120°
  field of view, 1/2.52-inch sensor, 0.7 µm pixels, and Dual Pixel PDAF. Also
  used for high-resolution macro photos.
- **3× telephoto:** 10 MP, f/2.4, 67mm-equivalent focal length, 1/3.52-inch
  sensor, 1.12 µm pixels, OIS, and Dual Pixel PDAF.
- **5× periscope telephoto:** 50 MP, f/3.4, 111mm-equivalent focal length,
  1/2.52-inch sensor, 0.7 µm pixels, OIS, and PDAF. Supports an optical-quality
  crop at 10× and digital zoom up to 100×.
- **Front (selfie):** 12 MP, f/2.2, 26mm-equivalent focal length, and Dual Pixel
  PDAF.

Digital crops from the S25 Ultra's main 23mm-equivalent camera may report longer
35mm-equivalent focal lengths while retaining the same physical 6mm, f/1.7
lens. These should remain labeled `Main Camera` rather than being treated as
separate physical lenses.

## DJI Mini 4K

The DJI Mini 4K has one integrated camera mounted on a three-axis mechanical
gimbal.

- **Sensor:** 1/2.3-inch CMOS with 12 MP effective resolution.
- **Lens:** Fixed 24mm-equivalent focal length, f/2.8, and 83° field of view.
- **Focus:** Fixed focus from 1 meter to infinity.
- **Stabilization:** Three-axis mechanical gimbal controlling pitch, roll, and
  yaw.
- **Video:** Up to 4K at 30 fps; 2.7K and 1080p up to 60 fps. Digital zoom is
  available up to 2× in 4K and 4× in 1080p.
