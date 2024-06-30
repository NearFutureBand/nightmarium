async function importAllImages() {
  const imported = import.meta.glob('./monsters/*.png');
  const resolved = await Promise.all(Object.values(imported).map((i) => i()));

  return resolved.reduce<Record<number, string>>((a, t) => {
    const imagePath = t.default;
    a[parseInt(imagePath.replace('/src/img/monsters/', '').replace('.png', ''))] = imagePath;
    return a;
  }, {});
}

export const MONSTER_PART = await importAllImages();
