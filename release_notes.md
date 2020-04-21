# Release Notes

## Version 0.1 - 4/20/2020

### Features:
- image editing
  - tools: pencil, fill, pan, zoom, square/circle, undo/redo
- palette management
  - palette import and export
  - palette merge on import
- bitmap editing
  - full editing support for mode 3 and mode 4, including import/export and undo/redo
  - importing currently loads images as mode 3, and quantizing a mode 3 image changes it to mode 4
  - quantizing using k-means
- spritesheet editing
  - no importing or undo/redo yet
  - full creation and editing support
  - sprite creation
    - customize what palette row sprites are previewed using
- exporting matches Usenti (to the best of our knowledge)
- other features:
  - documents can be recovered after the page is closed
  - application is a PWA and can be installed for offline use

### Known Issues:
- undo/redo doesn't work for spritesheets yet
- downloads have the incorrect name
- application fails to open sufficiently large images due to a restriction in localstorage
- application sometimes crashes when clicking on the very top edge of the palette
- some tool buttons don't do anything (features not implemented yet)
